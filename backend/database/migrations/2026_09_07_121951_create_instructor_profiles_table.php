<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('instructor_profiles', function (Blueprint $table) {
            $table->id();
            
            // Liên kết với bảng users
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            
            // Chuyên môn & Giới thiệu bản thân
            $table->string('expertise')->nullable(); // Chuyên môn phụ trách
            $table->text('bio')->nullable(); // Mô tả bản thân
            
            // Trạng thái xác minh hồ sơ bởi Admin: pending (chờ duyệt), approved (đã duyệt), rejected (từ chối)
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->text('rejection_reason')->nullable(); // Lý do từ chối (nếu có)
            
            $table->timestamp('verified_at')->nullable(); // Thời điểm được duyệt
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('instructor_profiles');
    }
};