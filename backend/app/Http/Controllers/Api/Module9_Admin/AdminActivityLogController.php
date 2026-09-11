<?php

namespace App\Http\Controllers\Api\Module9_Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminActivityLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user || $user->role !== 'admin') {
            abort(403, 'Bạn không có quyền truy cập chức năng Admin.');
        }

        $query = ActivityLog::with([
            'user:id,full_name,email,role',
        ]);

        if ($request->filled('action')) {
            $query->where(
                'action',
                $request->action
            );
        }

        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(
                'description',
                'like',
                "%{$search}%"
            );
        }

        $logs = $query
            ->latest('created_at')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'message' => 'Lấy nhật ký hoạt động thành công.',
            'data' => $logs,
        ]);
    }
}