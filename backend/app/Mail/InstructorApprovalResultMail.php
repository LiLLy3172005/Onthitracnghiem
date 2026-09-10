<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class InstructorApprovalResultMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $fullName;
    public string $status;
    public ?string $reason;
    public string $actionUrl;
    public ?string $profileId;
    public string $processedAt;

    public function __construct(
        string $fullName, 
        string $status, 
        ?string $reason = null, 
        ?string $actionUrl = null,
        ?string $profileId = null
    ) {
        $this->fullName = $fullName;
        $this->status = $status;
        $this->reason = $reason;
        $this->profileId = $profileId;
        $this->processedAt = now()->format('H:i:s - d/m/Y');
        $this->actionUrl = $actionUrl ?: ($status === 'approved' 
            ? 'http://localhost:5173/instructor/profile' 
            : 'http://localhost:5173/instructor-register');
    }

    public function build()
    {
        $subject = $this->status === 'approved'
            ? '🎉 [Brain Blitz] Chúc mừng! Hồ sơ Giảng viên của bạn đã được phê duyệt chính thức'
            : '📋 [Brain Blitz] Thông báo kết quả thẩm định hồ sơ Giảng viên';

        return $this->subject($subject)
                    ->view('emails.instructor-approval-result');
    }
}