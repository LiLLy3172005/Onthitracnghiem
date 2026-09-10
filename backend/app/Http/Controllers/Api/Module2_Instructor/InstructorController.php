<?php

namespace App\Http\Controllers\Api\Module2_Instructor;

use App\Http\Controllers\Controller;
use App\Models\Collaborator;
use App\Models\InstructorProfile;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;
use Carbon\Carbon;
use App\Mail\InstructorApprovalResultMail;

class InstructorController extends Controller
{
    /**
     * Helper chuẩn hóa format phản hồi JSON
     */
    protected function responseSuccess($message, $data = null, $code = 200)
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data'    => $data,
        ], $code);
    }

    protected function responseError($message, $code = 400, $errors = null)
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors'  => $errors,
        ], $code);
    }

    /*
    |--------------------------------------------------------------------------
    | CHỨC NĂNG 1: Đăng ký hồ sơ giảng viên / người tạo đề (MVP)
    |--------------------------------------------------------------------------
    */
    public function register(Request $request)
    {
        $currentUser = auth('sanctum')->user();

        $rules = [
            'specialization'   => 'required|string|max:255',
            'degree'           => 'nullable|string|max:100',
            'workplace'        => 'nullable|string|max:255',
            'experience_years' => 'nullable|string|max:50',
            'certificate_url'  => 'nullable|string|max:2000',
            'sample_exam_url'  => 'nullable|string|max:2000',
            'bio'              => 'nullable|string|max:2000',
            'subject_ids'      => 'required|array|min:1',
            'subject_ids.*'    => 'integer|exists:subjects,id',
        ];

        if (!$currentUser) {
            $rules['full_name'] = 'required|string|max:150';
            $rules['email']     = 'required|email|max:150|unique:users,email';
            $rules['password']  = 'required|string|min:6';
            $rules['phone']     = 'nullable|string|max:20|unique:users,phone';
        } else {
            $rules['phone'] = 'nullable|string|max:20|unique:users,phone,' . $currentUser->id;
        }

        $validated = $request->validate($rules, [
            'subject_ids.required' => 'Vui lòng chọn ít nhất 1 môn học phụ trách.',
            'subject_ids.min'      => 'Vui lòng chọn ít nhất 1 môn học phụ trách.',
        ]);

        return DB::transaction(function () use ($request, $currentUser, $validated) {
            // 1. Tạo hoặc cập nhật User
            $user = $currentUser;
            $token = null;

            if (!$user) {
                $user = User::create([
                    'full_name' => $validated['full_name'],
                    'email'     => $validated['email'],
                    'password'  => Hash::make($validated['password']),
                    'phone'     => $validated['phone'] ?? null,
                    'role'      => 'student', // Đăng ký xong chờ duyệt mới nâng lên instructor
                    'status'    => 'active',
                ]);
                $token = $user->createToken('auth_token')->plainTextToken;
            } else {
                if (!empty($validated['phone'])) {
                    $user->phone = $validated['phone'];
                    $user->save();
                }
            }

            // 2. Tạo hoặc nộp lại Hồ sơ giảng viên
            $profile = InstructorProfile::where('user_id', $user->id)->first();

            $profileData = [
                'specialization'   => $validated['specialization'],
                'degree'           => $validated['degree'] ?? null,
                'workplace'        => $validated['workplace'] ?? null,
                'experience_years' => $validated['experience_years'] ?? null,
                'certificate_url'  => $validated['certificate_url'] ?? null,
                'sample_exam_url'  => $validated['sample_exam_url'] ?? null,
                'bio'              => $validated['bio'] ?? null,
                'verify_status'    => 'pending',
                'reject_reason'    => null,
            ];

            if ($profile) {
                if ($profile->verify_status === 'approved') {
                    return $this->responseError('Tài khoản của bạn đã là Giảng viên chính thức, không cần đăng ký lại.', 409);
                }
                $profile->update($profileData);
            } else {
                $profileData['user_id'] = $user->id;
                $profile = InstructorProfile::create($profileData);
            }

            // 3. Gán môn học phụ trách
            if (!empty($validated['subject_ids'])) {
                $profile->subjects()->sync($validated['subject_ids']);
            }

            $profile->load(['user', 'subjects']);

            return $this->responseSuccess(
                'Nộp hồ sơ giảng viên thành công! Hồ sơ của bạn đang được Admin xét duyệt (tối đa 3 ngày làm việc).',
                [
                    'profile'      => $profile,
                    'user'         => $user,
                    'access_token' => $token,
                ],
                201
            );
        });
    }

    protected function checkAdmin()
    {
        $user = auth('sanctum')->user();
        if (!$user || $user->role !== 'admin') {
            return false;
        }
        return $user;
    }

    /*
    |--------------------------------------------------------------------------
    | CHỨC NĂNG 2: Xác minh / Duyệt hồ sơ (Admin - MVP)
    |--------------------------------------------------------------------------
    */
    public function approve(Request $request, $id)
    {
        $admin = $this->checkAdmin();
        if (!$admin) {
            return $this->responseError('Chỉ tài khoản Quản trị viên (Admin) mới có quyền thực hiện thao tác này.', 403);
        }

        $profile = InstructorProfile::with('user')->find($id);

        if (!$profile) {
            return $this->responseError('Không tìm thấy hồ sơ giảng viên.', 404);
        }

        $adminId = $admin->id;

        DB::transaction(function () use ($profile, $adminId) {
            $profile->update([
                'verify_status' => 'approved',
                'verified_by'   => $adminId,
                'verified_at'   => now(),
                'reject_reason' => null,
            ]);

            // Nâng cấp quyền người dùng thành instructor
            if ($profile->user) {
                $profile->user->update([
                    'role'   => 'instructor',
                    'status' => 'active',
                ]);
            }
        });

        $profile->load(['user', 'subjects', 'verifier']);

        // Gửi email thông báo phê duyệt hồ sơ giảng viên
        if ($profile->user && !empty($profile->user->email)) {
            try {
                Mail::to($profile->user->email)->send(new InstructorApprovalResultMail(
                    $profile->user->full_name ?? 'Quý Thầy/Cô',
                    'approved',
                    null,
                    null,
                    (string)$profile->id
                ));
            } catch (\Throwable $e) {
                Log::warning('Gửi email phê duyệt giảng viên thất bại: ' . $e->getMessage());
            }
        }

        return $this->responseSuccess('Phê duyệt hồ sơ giảng viên thành công.', $profile);
    }

    public function reject(Request $request, $id)
    {
        $admin = $this->checkAdmin();
        if (!$admin) {
            return $this->responseError('Chỉ tài khoản Quản trị viên (Admin) mới có quyền thực hiện thao tác này.', 403);
        }

        $request->validate([
            'reject_reason' => 'required|string|max:500',
        ], [
            'reject_reason.required' => 'Vui lòng nhập lý do từ chối hồ sơ.',
        ]);

        $profile = InstructorProfile::with('user')->find($id);

        if (!$profile) {
            return $this->responseError('Không tìm thấy hồ sơ giảng viên.', 404);
        }

        $adminId = $admin->id;

        $profile->update([
            'verify_status' => 'rejected',
            'reject_reason' => $request->reject_reason,
            'verified_by'   => $adminId,
            'verified_at'   => now(),
        ]);

        $profile->load(['user', 'subjects', 'verifier']);

        // Gửi email thông báo từ chối hồ sơ giảng viên kèm lý do
        if ($profile->user && !empty($profile->user->email)) {
            try {
                Mail::to($profile->user->email)->send(new InstructorApprovalResultMail(
                    $profile->user->full_name ?? 'Quý Thầy/Cô',
                    'rejected',
                    $request->reject_reason,
                    null,
                    (string)$profile->id
                ));
            } catch (\Throwable $e) {
                Log::warning('Gửi email từ chối giảng viên thất bại: ' . $e->getMessage());
            }
        }

        return $this->responseSuccess('Đã từ chối hồ sơ giảng viên và lưu lý do phản hồi.', $profile);
    }

    /**
     * Lấy user hiện tại từ sanctum hoặc fallback về giảng viên mẫu (hỗ trợ demo và kiểm thử trực tiếp)
     */
    protected function getEffectiveInstructorUser()
    {
        $user = auth('sanctum')->user();
        if (!$user) {
            $user = User::where('role', 'instructor')->first() ?? User::find(2);
        }
        return $user;
    }

    /*
    |--------------------------------------------------------------------------
    | CHỨC NĂNG 3: Sửa thông tin giảng viên (Giảng viên - MVP)
    |--------------------------------------------------------------------------
    */
    public function getProfile(Request $request)
    {
        $user = $this->getEffectiveInstructorUser();
        if (!$user) {
            return $this->responseError('Vui lòng đăng nhập.', 401);
        }

        $profile = InstructorProfile::with(['user', 'subjects', 'collaborators.memberUser', 'verifier'])
            ->where('user_id', $user->id)
            ->first();

        if (!$profile) {
            return $this->responseSuccess('Bạn chưa có hồ sơ giảng viên.', [
                'has_profile' => false,
                'user'        => $user,
            ]);
        }

        return $this->responseSuccess('Lấy thông tin hồ sơ giảng viên thành công.', [
            'has_profile' => true,
            'profile'     => $profile,
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = $this->getEffectiveInstructorUser();
        if (!$user) {
            return $this->responseError('Vui lòng đăng nhập.', 401);
        }

        $profile = InstructorProfile::where('user_id', $user->id)->first();
        if (!$profile) {
            return $this->responseError('Hồ sơ giảng viên không tồn tại. Vui lòng đăng ký trước.', 404);
        }

        $validated = $request->validate([
            'full_name'      => 'sometimes|required|string|max:150',
            'phone'          => ['nullable', 'string', 'max:20', Rule::unique('users', 'phone')->ignore($user->id)],
            'avatar_url'     => 'nullable|string|max:255',
            'specialization'   => 'sometimes|required|string|max:255',
            'degree'           => 'nullable|string|max:100',
            'workplace'        => 'nullable|string|max:255',
            'experience_years' => 'nullable|string|max:50',
            'certificate_url'  => 'nullable|string|max:2000',
            'sample_exam_url'  => 'nullable|string|max:2000',
            'bio'              => 'nullable|string|max:2000',
            'subject_ids'      => 'nullable|array',
            'subject_ids.*'    => 'integer|exists:subjects,id',
        ]);

        DB::transaction(function () use ($user, $profile, $validated) {
            // Cập nhật bảng users
            $userUpdates = [];
            if (isset($validated['full_name'])) $userUpdates['full_name'] = $validated['full_name'];
            if (array_key_exists('phone', $validated)) $userUpdates['phone'] = $validated['phone'];
            if (array_key_exists('avatar_url', $validated)) $userUpdates['avatar_url'] = $validated['avatar_url'];
            if (!empty($userUpdates)) {
                $user->update($userUpdates);
            }

            // Cập nhật bảng instructor_profiles
            $profileUpdates = [];
            if (isset($validated['specialization'])) $profileUpdates['specialization'] = $validated['specialization'];
            if (array_key_exists('degree', $validated)) $profileUpdates['degree'] = $validated['degree'];
            if (array_key_exists('workplace', $validated)) $profileUpdates['workplace'] = $validated['workplace'];
            if (array_key_exists('experience_years', $validated)) $profileUpdates['experience_years'] = $validated['experience_years'];
            if (array_key_exists('certificate_url', $validated)) $profileUpdates['certificate_url'] = $validated['certificate_url'];
            if (array_key_exists('sample_exam_url', $validated)) $profileUpdates['sample_exam_url'] = $validated['sample_exam_url'];
            if (array_key_exists('bio', $validated)) $profileUpdates['bio'] = $validated['bio'];
            if (!empty($profileUpdates)) {
                $profile->update($profileUpdates);
            }

            // Cập nhật danh sách môn học
            if (isset($validated['subject_ids'])) {
                $profile->subjects()->sync($validated['subject_ids']);
            }
        });

        $profile->load(['user', 'subjects']);

        return $this->responseSuccess('Cập nhật thông tin giảng viên thành công.', [
            'profile' => $profile,
            'user'    => $user->fresh(),
        ]);
    }

    /**
     * Tải lên tài liệu minh chứng / bằng cấp / đề thi mẫu thẩm định
     */
    public function uploadEvidence(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:jpeg,png,jpg,pdf,doc,docx|max:10240', // tối đa 10MB
        ]);

        $file = $request->file('file');
        $extension = $file->getClientOriginalExtension();
        $safeName = 'doc_' . time() . '_' . uniqid() . '.' . $extension;
        $destinationPath = public_path('uploads/instructor_evidence');

        if (!file_exists($destinationPath)) {
            mkdir($destinationPath, 0777, true);
        }

        $file->move($destinationPath, $fileName = $safeName);
        $fileUrl = '/uploads/instructor_evidence/' . $safeName;

        return $this->responseSuccess('Tải lên minh chứng thành công.', [
            'file_url'  => $fileUrl,
            'file_name' => $file->getClientOriginalName(),
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | CHỨC NĂNG 4: Xóa / Khóa / Mở khóa tài khoản giảng viên (Admin - MVP)
    |--------------------------------------------------------------------------
    */
    public function toggleStatus(Request $request, $id)
    {
        $admin = $this->checkAdmin();
        if (!$admin) {
            return $this->responseError('Chỉ tài khoản Quản trị viên (Admin) mới có quyền thực hiện thao tác này.', 403);
        }

        $profile = InstructorProfile::with('user')->find($id);
        if (!$profile || !$profile->user) {
            return $this->responseError('Không tìm thấy tài khoản giảng viên.', 404);
        }

        $user = $profile->user;
        $newStatus = ($user->status === 'active') ? 'locked' : 'active';
        $user->status = $newStatus;
        $user->save();

        $actionText = ($newStatus === 'locked') ? 'Khóa tài khoản giảng viên thành công.' : 'Mở khóa tài khoản giảng viên thành công.';

        return $this->responseSuccess($actionText, [
            'profile_id' => $profile->id,
            'user_id'    => $user->id,
            'status'     => $user->status,
            'user'       => $user,
        ]);
    }

    public function deleteInstructor(Request $request, $id)
    {
        $admin = $this->checkAdmin();
        if (!$admin) {
            return $this->responseError('Chỉ tài khoản Quản trị viên (Admin) mới có quyền thực hiện thao tác này.', 403);
        }

        $profile = InstructorProfile::with('user')->find($id);
        if (!$profile) {
            return $this->responseError('Không tìm thấy hồ sơ giảng viên.', 404);
        }

        $userName = $profile->user ? $profile->user->full_name : 'Giảng viên';

        DB::transaction(function () use ($profile) {
            // Xóa quan hệ môn học và cộng tác viên
            $profile->subjects()->detach();
            Collaborator::where('owner_instructor_id', $profile->id)->delete();

            // Nếu user chỉ là instructor và muốn gỡ bỏ hoàn toàn quyền
            if ($profile->user) {
                $profile->user->update(['role' => 'student']);
            }

            $profile->delete();
        });

        return $this->responseSuccess("Đã gỡ bỏ hồ sơ giảng viên [{$userName}] khỏi hệ thống thành công.");
    }

    /*
    |--------------------------------------------------------------------------
    | CHỨC NĂNG 5: Quản lý quyền cộng tác biên soạn đề (Version sau)
    |--------------------------------------------------------------------------
    */
    public function getCollaborators(Request $request)
    {
        $user = $this->getEffectiveInstructorUser();
        if (!$user) {
            return $this->responseError('Vui lòng đăng nhập.', 401);
        }

        $profile = InstructorProfile::where('user_id', $user->id)->first();
        if (!$profile) {
            return $this->responseError('Không tìm thấy hồ sơ giảng viên của bạn.', 404);
        }

        $collaborators = Collaborator::with('memberUser')
            ->where('owner_instructor_id', $profile->id)
            ->get();

        return $this->responseSuccess('Lấy danh sách cộng tác viên thành công.', $collaborators);
    }

    public function addCollaborator(Request $request)
    {
        $user = $this->getEffectiveInstructorUser();
        if (!$user) {
            return $this->responseError('Vui lòng đăng nhập.', 401);
        }

        $profile = InstructorProfile::where('user_id', $user->id)->first();
        if (!$profile) {
            return $this->responseError('Chỉ giảng viên đã có hồ sơ mới có thể phân quyền cộng tác.', 403);
        }

        $request->validate([
            'email'      => 'required|email|exists:users,email',
            'permission' => 'required|in:view,edit,approve',
        ], [
            'email.exists'      => 'Email người dùng không tồn tại trên hệ thống.',
            'permission.in'     => 'Quyền hạn phải là: view (Xem), edit (Biên soạn), hoặc approve (Duyệt).',
        ]);

        $memberUser = User::where('email', $request->email)->first();

        if ($memberUser->id === $user->id) {
            return $this->responseError('Bạn không thể tự thêm chính mình làm cộng tác viên.', 422);
        }

        $existing = Collaborator::where('owner_instructor_id', $profile->id)
            ->where('member_user_id', $memberUser->id)
            ->first();

        if ($existing) {
            return $this->responseError('Thành viên này đã có trong danh sách cộng tác viên. Hãy sửa quyền hạn nếu muốn thay đổi.', 409);
        }

        $collaborator = Collaborator::create([
            'owner_instructor_id' => $profile->id,
            'member_user_id'      => $memberUser->id,
            'permission'          => $request->permission,
            'created_at'          => now(),
        ]);

        $collaborator->load('memberUser');

        return $this->responseSuccess("Đã thêm thành viên [{$memberUser->full_name}] vào nhóm cộng tác biên soạn.", $collaborator, 201);
    }

    public function updateCollaborator(Request $request, $id)
    {
        $user = auth('sanctum')->user();
        $profile = InstructorProfile::where('user_id', $user->id)->first();
        if (!$profile) {
            return $this->responseError('Không có quyền thao tác.', 403);
        }

        $request->validate([
            'permission' => 'required|in:view,edit,approve',
        ]);

        $collaborator = Collaborator::where('id', $id)
            ->where('owner_instructor_id', $profile->id)
            ->first();

        if (!$collaborator) {
            return $this->responseError('Không tìm thấy cộng tác viên.', 404);
        }

        $collaborator->permission = $request->permission;
        $collaborator->save();
        $collaborator->load('memberUser');

        return $this->responseSuccess('Cập nhật quyền cộng tác viên thành công.', $collaborator);
    }

    public function removeCollaborator(Request $request, $id)
    {
        $user = auth('sanctum')->user();
        $profile = InstructorProfile::where('user_id', $user->id)->first();
        if (!$profile) {
            return $this->responseError('Không có quyền thao tác.', 403);
        }

        $collaborator = Collaborator::where('id', $id)
            ->where('owner_instructor_id', $profile->id)
            ->first();

        if (!$collaborator) {
            return $this->responseError('Không tìm thấy cộng tác viên.', 404);
        }

        $collaborator->delete();

        return $this->responseSuccess('Đã gỡ bỏ cộng tác viên khỏi nhóm biên soạn đề.');
    }

    /*
    |--------------------------------------------------------------------------
    | CHỨC NĂNG 6: Xem danh sách / tìm kiếm giảng viên (MVP)
    |--------------------------------------------------------------------------
    */
    public function listAdmin(Request $request)
    {
        $admin = $this->checkAdmin();
        if (!$admin) {
            return $this->responseError('Chỉ tài khoản Quản trị viên (Admin) mới có quyền thực hiện thao tác này.', 403);
        }

        // Tự động kiểm tra và chuyển trạng thái các hồ sơ quá hạn cam kết SLA 3 ngày
        self::checkAndExpireOverdueProfiles();

        $query = InstructorProfile::with(['user', 'subjects', 'verifier']);

        // Tìm kiếm từ khóa (tên, email, sđt, chuyên môn)
        if ($request->filled('search')) {
            $search = '%' . trim($request->search) . '%';
            $query->where(function ($q) use ($search) {
                $q->where('specialization', 'like', $search)
                  ->orWhere('bio', 'like', $search)
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('full_name', 'like', $search)
                         ->orWhere('email', 'like', $search)
                         ->orWhere('phone', 'like', $search);
                  });
            });
        }

        // Lọc theo trạng thái duyệt
        if ($request->filled('verify_status') && $request->verify_status !== 'all') {
            $query->where('verify_status', $request->verify_status);
        }

        // Lọc theo trạng thái tài khoản user (active/locked)
        if ($request->filled('user_status') && $request->user_status !== 'all') {
            $query->whereHas('user', function ($uq) use ($request) {
                $uq->where('status', $request->user_status);
            });
        }

        // Lọc theo môn học
        if ($request->filled('subject_id') && $request->subject_id !== 'all') {
            $query->whereHas('subjects', function ($sq) use ($request) {
                $sq->where('subjects.id', $request->subject_id);
            });
        }

        $instructors = $query->orderBy('created_at', 'desc')->get();

        // Thống kê nhanh phục vụ Dashboard Admin
        $counts = [
            'total'    => InstructorProfile::count(),
            'pending'  => InstructorProfile::where('verify_status', 'pending')->count(),
            'approved' => InstructorProfile::where('verify_status', 'approved')->count(),
            'rejected' => InstructorProfile::where('verify_status', 'rejected')->count(),
            'locked'   => InstructorProfile::whereHas('user', function ($q) { $q->where('status', 'locked'); })->count(),
        ];

        return $this->responseSuccess('Lấy danh sách giảng viên thành công.', [
            'counts'      => $counts,
            'instructors' => $instructors,
        ]);
    }

    public function listPublic(Request $request)
    {
        // Người học tra cứu giảng viên uy tín: chỉ hiển thị approved và user active
        $query = InstructorProfile::with(['user', 'subjects'])
            ->where('verify_status', 'approved')
            ->whereHas('user', function ($q) {
                $q->where('status', 'active');
            });

        if ($request->filled('search')) {
            $search = '%' . trim($request->search) . '%';
            $query->where(function ($q) use ($search) {
                $q->where('specialization', 'like', $search)
                  ->orWhere('bio', 'like', $search)
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('full_name', 'like', $search);
                  });
            });
        }

        if ($request->filled('subject_id') && $request->subject_id !== 'all') {
            $query->whereHas('subjects', function ($sq) use ($request) {
                $sq->where('subjects.id', $request->subject_id);
            });
        }

        $instructors = $query->orderBy('created_at', 'desc')->get();

        return $this->responseSuccess('Lấy danh sách giảng viên uy tín thành công.', $instructors);
    }

    public function getPublicDetail($id)
    {
        $profile = InstructorProfile::with(['user', 'subjects'])
            ->where('verify_status', 'approved')
            ->where('id', $id)
            ->first();

        if (!$profile) {
            return $this->responseError('Không tìm thấy thông tin giảng viên.', 404);
        }

        // Đếm số đề thi mẫu hoặc thống kê
        $stats = [
            'exams_count'     => DB::table('exams')->where('created_by', $profile->user_id)->count(),
            'questions_count' => DB::table('questions')->where('created_by', $profile->user_id)->count(),
        ];

        return $this->responseSuccess('Lấy chi tiết giảng viên thành công.', [
            'profile' => $profile,
            'stats'   => $stats,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | SLA 3 NGÀY: Tự động từ chối hồ sơ quá hạn thẩm định & Quét định kỳ
    |--------------------------------------------------------------------------
    */
    public static function checkAndExpireOverdueProfiles(): array
    {
        // Ngưỡng quá hạn SLA 3 ngày (72 giờ)
        $threshold = Carbon::now()->subDays(3);
        $overdueProfiles = InstructorProfile::with('user')
            ->where('verify_status', 'pending')
            ->where('created_at', '<=', $threshold)
            ->get();

        $expiredList = [];
        foreach ($overdueProfiles as $profile) {
            $profile->verify_status = 'rejected';
            $profile->reject_reason = 'Hệ thống tự động từ chối do quá thời hạn cam kết thẩm định (SLA ≤ 3 ngày làm việc mà Quản trị viên chưa xử lý). Quý Thầy/Cô vui lòng cập nhật lại hồ sơ và nộp lại.';
            $profile->verified_at = Carbon::now();
            $profile->save();

            // Gửi email thông báo từ chối do quá hạn SLA
            if ($profile->user && !empty($profile->user->email)) {
                try {
                    Mail::to($profile->user->email)->send(new InstructorApprovalResultMail(
                        $profile->user->full_name ?? 'Quý Thầy/Cô',
                        'rejected',
                        $profile->reject_reason
                    ));
                } catch (\Throwable $e) {
                    Log::warning('Gửi email quá hạn SLA giảng viên thất bại: ' . $e->getMessage());
                }
            }

            $expiredList[] = [
                'id'         => $profile->id,
                'full_name'  => $profile->user->full_name ?? 'N/A',
                'email'      => $profile->user->email ?? 'N/A',
                'created_at' => $profile->created_at,
            ];
        }

        return $expiredList;
    }

    /**
     * Endpoint API quét hồ sơ quá hạn SLA 3 ngày cho Admin
     */
    public function checkOverdue(Request $request)
    {
        $admin = $this->checkAdmin();
        if (!$admin) {
            return $this->responseError('Chỉ tài khoản Quản trị viên (Admin) mới có quyền quét SLA hồ sơ.', 403);
        }

        $expired = self::checkAndExpireOverdueProfiles();
        $count = count($expired);

        return $this->responseSuccess(
            $count > 0 
                ? "Đã quét và tự động từ chối {$count} hồ sơ quá hạn SLA 3 ngày làm việc." 
                : "Tất cả hồ sơ chờ duyệt đều còn trong hạn cam kết SLA 3 ngày làm việc.",
            [
                'expired_count' => $count,
                'expired_list'  => $expired,
            ]
        );
    }

    /*
    |--------------------------------------------------------------------------
    | TIỆN ÍCH: Danh sách môn học cho dropdown
    |--------------------------------------------------------------------------
    */

    public function getSubjects()
    {
        $subjects = Subject::orderBy('name', 'asc')->get();
        return $this->responseSuccess('Lấy danh sách môn học thành công.', $subjects);
    }
}
