<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $status === 'approved' ? 'Thông báo Phê duyệt Hồ sơ Giảng viên' : 'Thông báo Kết quả Thẩm định Hồ sơ Giảng viên' }} | Brain Blitz</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 36px 12px; font-family: 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5; color: #18181b; -webkit-font-smoothing: antialiased; line-height: 1.6;">
    
    <!-- Corporate Email Card (Max 580px matching user screenshot) -->
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e4e4e7; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);">
        
        <!-- Header Banner (Màu của App: Dark Ink #161618 với điểm nhấn Gold #E5A038) -->
        <tr>
            <td style="padding: 34px 32px 28px 32px; background: #161618; text-align: center; border-bottom: 2px solid #e5a038;">
                @php
                    $logoImg = isset($message) && file_exists(public_path('image/brainblitz_header_gold.png'))
                        ? $message->embed(public_path('image/brainblitz_header_gold.png'))
                        : 'http://localhost:8000/image/brainblitz_header_gold.png';
                @endphp
                <div style="margin-bottom: 12px;">
                    <img src="{{ $logoImg }}" alt="Brain Blitz Logo" style="height: 52px; width: auto; max-width: 320px; display: inline-block;" border="0">
                </div>
                <div style="display: inline-block; padding: 4px 16px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 20px; font-size: 11px; font-weight: 600; color: #ffffff; letter-spacing: 0.8px; text-transform: uppercase;">
                    Hệ Thống Ôn Thi Trắc Nghiệm Thông Minh
                </div>
            </td>
        </tr>

        <!-- Main Body (Giữ nguyên chính xác như trong ảnh người dùng gửi) -->
        <tr>
            <td style="padding: 36px 32px 30px 32px;">
                
                <!-- Salutation -->
                <p style="font-size: 16px; font-weight: 600; margin: 0 0 16px 0; color: #18181b;">
                    Kính gửi Quý Thầy/Cô <strong>{{ $fullName }}</strong>,
                </p>

                <!-- Document Context -->
                <p style="font-size: 14.5px; line-height: 1.65; color: #3f3f46; margin: 0 0 24px 0;">
                    Hội đồng Chuyên môn Brain Blitz xin gửi lời chào trân trọng và cảm ơn Quý Thầy/Cô đã gửi hồ sơ đăng ký tham gia đội ngũ Giảng viên / Tác giả biên soạn đề thi trên hệ thống.
                </p>

                @if($status === 'approved')
                    <!-- APPROVED OFFICIAL NOTICE -->
                    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-left: 4px solid #16a34a; border-radius: 6px; padding: 18px 20px; margin-bottom: 24px;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                                <td width="28" valign="top" style="font-size: 18px; color: #16a34a; font-weight: bold; line-height: 20px;">
                                    ✓
                                </td>
                                <td style="padding-left: 8px;">
                                    <div style="font-size: 15px; font-weight: 700; color: #18181b; margin-bottom: 4px;">
                                        Thông báo phê duyệt hồ sơ chính thức
                                    </div>
                                    <div style="font-size: 13.5px; color: #52525b; line-height: 1.55;">
                                        Hội đồng Thẩm định xác nhận hồ sơ năng lực và văn bằng chuyên môn của Quý Thầy/Cô đạt chuẩn. Tài khoản của Quý Thầy/Cô đã được cấp quyền <strong>Giảng viên</strong> trên toàn hệ thống.
                                    </div>
                                </td>
                            </tr>
                        </table>
                    </div>
                @else
                    <!-- REJECTED OFFICIAL NOTICE (Giữ nguyên chính xác như Ảnh 2) -->
                    <div style="background-color: #fafafa; border: 1px solid #e4e4e7; border-left: 4px solid #d97706; border-radius: 6px; padding: 18px 20px; margin-bottom: 24px;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                                <td width="28" valign="top" style="font-size: 18px; color: #d97706; font-weight: bold; line-height: 20px;">
                                    !
                                </td>
                                <td style="padding-left: 8px;">
                                    <div style="font-size: 15px; font-weight: 700; color: #18181b; margin-bottom: 4px;">
                                        Thông báo kết quả thẩm định hồ sơ
                                    </div>
                                    <div style="font-size: 13.5px; color: #52525b; line-height: 1.55;">
                                        Căn cứ theo Quy chế kiểm duyệt chất lượng giảng viên hiện hành, Hội đồng Thẩm định xin thông báo hồ sơ của Quý Thầy/Cô <strong>chưa đủ điều kiện phê duyệt</strong> trong đợt xét duyệt này.
                                    </div>
                                </td>
                            </tr>
                        </table>
                    </div>

                    <!-- ADMIN REASON / FEEDBACK QUOTE (Giữ nguyên viền nét đứt như Ảnh 2) -->
                    @if(!empty($reason))
                    <div style="margin-bottom: 24px; padding: 16px 20px; background-color: #fbfbfb; border: 1px dashed #d4d4d8; border-radius: 8px;">
                        <div style="font-size: 12px; font-weight: 700; color: #71717a; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
                            Ý KIẾN ĐÁNH GIÁ TỪ HỘI ĐỒNG THẨM ĐỊNH:
                        </div>
                        <div style="font-size: 14.5px; font-weight: 500; color: #18181b; line-height: 1.6; font-style: italic;">
                            "{{ $reason }}"
                        </div>
                    </div>
                    @endif
                @endif

                <!-- DOSSIER METADATA TABLE (Giữ nguyên chính xác như Ảnh 3) -->
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 28px; border: 1px solid #f4f4f5; border-radius: 8px; overflow: hidden;">
                    <tr style="background-color: #fafafa;">
                        <td colspan="2" style="padding: 10px 16px; font-size: 12px; font-weight: 700; color: #71717a; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #f4f4f5;">
                            BIÊN BẢN THẨM ĐỊNH HỒ SƠ
                        </td>
                    </tr>
                    @if(!empty($profileId))
                    <tr>
                        <td width="40%" style="padding: 10px 16px; font-size: 13.5px; color: #71717a; border-bottom: 1px solid #f4f4f5;">Mã định danh hồ sơ:</td>
                        <td style="padding: 10px 16px; font-size: 13.5px; font-weight: 600; color: #18181b; border-bottom: 1px solid #f4f4f5;">#{{ $profileId }}</td>
                    </tr>
                    @endif
                    <tr>
                        <td width="40%" style="padding: 10px 16px; font-size: 13.5px; color: #71717a; border-bottom: 1px solid #f4f4f5;">Người đăng ký:</td>
                        <td style="padding: 10px 16px; font-size: 13.5px; font-weight: 600; color: #18181b; border-bottom: 1px solid #f4f4f5;">{{ $fullName }}</td>
                    </tr>
                    <tr>
                        <td width="40%" style="padding: 10px 16px; font-size: 13.5px; color: #71717a; border-bottom: 1px solid #f4f4f5;">Thời gian xử lý:</td>
                        <td style="padding: 10px 16px; font-size: 13.5px; color: #18181b; border-bottom: 1px solid #f4f4f5;">{{ $processedAt }}</td>
                    </tr>
                    <tr>
                        <td width="40%" style="padding: 10px 16px; font-size: 13.5px; color: #71717a;">Kết luận thẩm định:</td>
                        <td style="padding: 10px 16px; font-size: 13.5px;">
                            @if($status === 'approved')
                                <span style="font-weight: 700; color: #15803d;">ĐÃ PHÊ DUYỆT CHÍNH THỨC</span>
                            @else
                                <span style="font-weight: 700; color: #dc2626;">CHƯA ĐẠT TIÊU CHUẨN</span>
                            @endif
                        </td>
                    </tr>
                </table>

                <!-- GUIDANCE & CTA (Giữ nguyên như Ảnh 3) -->
                @if($status === 'approved')
                    <p style="font-size: 14px; line-height: 1.6; color: #52525b; margin: 0 0 24px 0;">
                        Quý Thầy/Cô có thể đăng nhập vào hệ thống để bắt đầu khởi tạo ngân hàng câu hỏi, phát hành đề thi và quản lý phòng thi trực tuyến.
                    </p>
                    <div style="text-align: left; margin: 0 0 32px 0;">
                        <a href="{{ $actionUrl }}" style="display: inline-block; background-color: #161618; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 26px; border-radius: 6px;">
                            Truy cập Bảng điều khiển Giảng viên &rarr;
                        </a>
                    </div>
                @else
                    <p style="font-size: 14px; line-height: 1.6; color: #52525b; margin: 0 0 20px 0;">
                        Quý Thầy/Cô có thể cập nhật, bổ sung văn bằng, chứng chỉ nghiệp vụ hoặc đề thi mẫu theo các góp ý trên và nộp lại hồ sơ để Ban Chuyên môn thẩm định lại bất kỳ lúc nào.
                    </p>
                    <div style="text-align: left; margin: 0 0 32px 0;">
                        <a href="{{ $actionUrl }}" style="display: inline-block; background-color: #161618; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 26px; border-radius: 6px;">
                            Cập nhật &amp; Gửi lại hồ sơ &rarr;
                        </a>
                    </div>
                @endif

                <!-- FORMAL SIGN-OFF (Giữ nguyên như Ảnh 3) -->
                <div style="border-top: 1px solid #f4f4f5; padding-top: 20px; margin-top: 24px;">
                    <p style="font-size: 14px; color: #71717a; margin: 0 0 4px 0;">Trân trọng,</p>
                    <p style="font-size: 14px; font-weight: 700; color: #18181b; margin: 0 0 2px 0;">Hội đồng Thẩm định &amp; Quản trị Giảng viên</p>
                    <p style="font-size: 13px; color: #a1a1aa; margin: 0;">Ban Quản Trị Hệ thống Brain Blitz</p>
                </div>

            </td>
        </tr>

        <!-- Corporate Footer -->
        <tr>
            <td style="padding: 24px 32px; background-color: #fafafa; border-top: 1px solid #f4f4f5;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                        <td style="font-size: 12px; color: #71717a; line-height: 1.6;">
                            <strong style="color: #18181b;">Hệ Thống Đánh Giá Năng Lực &amp; Ôn Thi Trắc Nghiệm Brain Blitz</strong><br>
                            Bộ phận Hỗ trợ Giảng viên: <a href="mailto:support@brainblitz.vn" style="color: #18181b; text-decoration: underline;">support@brainblitz.vn</a> | Tổng đài: 1900 6868<br>
                            Địa chỉ: Khu Công nghệ Cao, Đô thị Đại học Đà Nẵng, Việt Nam
                        </td>
                    </tr>
                    <tr>
                        <td style="padding-top: 12px; font-size: 11px; color: #a1a1aa; line-height: 1.5;">
                            Thông báo này được gửi tự động từ máy chủ Brain Blitz đến tài khoản đăng ký của Quý Thầy/Cô. Bản quyền &copy; 2026 Brain Blitz Inc. Mọi quyền được bảo lưu.
                        </td>
                    </tr>
                </table>
            </td>
        </tr>

    </table>

</body>
</html>

