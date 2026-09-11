<?php

namespace App\Http\Controllers\Api\Module9_Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Exam;
use App\Models\Question;
use App\Models\Report;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminReportController extends Controller
{
    private function authorizeAdmin(Request $request): void
    {
        $user = $request->user();

        if (!$user || $user->role !== 'admin') {
            abort(403, 'Bạn không có quyền truy cập chức năng Admin.');
        }
    }

    public function index(Request $request): JsonResponse
    {
        $this->authorizeAdmin($request);

        $query = Report::with([
            'reporter:id,full_name,email',
            'resolver:id,full_name,email',
        ]);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('target_type')) {
            $query->where(
                'target_type',
                $request->target_type
            );
        }

        $reports = $query
            ->latest('created_at')
            ->paginate(15);

        return response()->json([
            'success' => true,
            'message' => 'Lấy danh sách báo cáo thành công.',
            'data' => $reports,
        ]);
    }

    public function show(
        Request $request,
        int $id
    ): JsonResponse {
        $this->authorizeAdmin($request);

        $report = Report::with([
            'reporter:id,full_name,email',
            'resolver:id,full_name,email',
        ])->findOrFail($id);

        $target = null;

        if ($report->target_type === 'question') {
            $target = Question::with([
                'subject:id,name',
                'topic:id,name',
                'creator:id,full_name,email',
            ])->find($report->target_id);
        }

        if ($report->target_type === 'exam') {
            $target = Exam::with([
                'subject:id,name',
                'topic:id,name',
                'creator:id,full_name,email',
            ])->find($report->target_id);
        }

        return response()->json([
            'success' => true,
            'message' => 'Lấy chi tiết báo cáo thành công.',
            'data' => [
                'report' => $report,
                'target' => $target,
            ],
        ]);
    }

    public function resolve(
        Request $request,
        int $id
    ): JsonResponse {
        $this->authorizeAdmin($request);

        $request->validate([
            'action' => [
                'required',
                'in:resolve,reject,hide',
            ],
        ]);

        $admin = $request->user();

        $report = Report::findOrFail($id);

        if ($request->action === 'hide') {

            if ($report->target_type === 'question') {
                Question::where(
                    'id',
                    $report->target_id
                )->update([
                    'status' => 'rejected',
                    'reviewed_by' => $admin->id,
                ]);
            }

            if ($report->target_type === 'exam') {
                Exam::where(
                    'id',
                    $report->target_id
                )->update([
                    'status' => 'hidden',
                ]);
            }
        }

        $report->update([
            'status' => $request->action === 'reject'
                ? 'rejected'
                : 'resolved',

            'resolved_by' => $admin->id,
            'resolved_at' => now(),
        ]);

        ActivityLog::create([
            'user_id' => $admin->id,
            'action' => 'HANDLE_REPORT',
            'description' =>
                "Admin xử lý báo cáo #{$report->id}: {$request->action}",
            'ip_address' => $request->ip(),
            'created_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Xử lý báo cáo thành công.',
            'data' => $report->fresh(),
        ]);
    }
}