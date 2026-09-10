<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('exams', function (Blueprint $table) {
            if (!Schema::hasColumn('exams', 'rating')) {
                $table->decimal('rating', 3, 2)->default(5.00)->after('status')->comment('Điểm đánh giá trung bình từ 1.00 đến 5.00');
            }
            if (!Schema::hasColumn('exams', 'views_count')) {
                $table->unsignedInteger('views_count')->default(0)->after('rating')->comment('Lượt xem đề thi');
            }
            if (!Schema::hasColumn('exams', 'description')) {
                $table->text('description')->nullable()->after('title')->comment('Mô tả ngắn gọn về đề thi');
            }
        });
    }

    public function down(): void
    {
        Schema::table('exams', function (Blueprint $table) {
            $table->dropColumn(['rating', 'views_count', 'description']);
        });
    }
};
