<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Module 4 - Bo sung cot code vao bang exams
     * de luu ma de thi tu dong (vi du: WEB-GK-001)
     */
    public function up(): void
    {
        Schema::table('exams', function (Blueprint $table) {
            // Them cot code sau cot title (neu chua ton tai)
            if (!Schema::hasColumn('exams', 'code')) {
                $table->string('code', 30)->nullable()->unique()->after('title')
                      ->comment('Ma de thi tu dong sinh');
            }
        });
    }

    public function down(): void
    {
        Schema::table('exams', function (Blueprint $table) {
            if (Schema::hasColumn('exams', 'code')) {
                $table->dropUnique(['code']);
                $table->dropColumn('code');
            }
        });
    }
};