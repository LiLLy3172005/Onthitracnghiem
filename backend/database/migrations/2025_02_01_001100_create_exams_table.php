<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exams', function (Blueprint $table) {
            $table->id();
            $table->string('title', 255);
            $table->foreignId('subject_id')->constrained('subjects');
            $table->foreignId('topic_id')->nullable()->constrained('topics')->nullOnDelete();
            $table->enum('difficulty', ['easy', 'medium', 'hard', 'mixed'])->default('mixed');
            $table->integer('duration_minutes')->default(30);
            $table->integer('total_questions')->default(0);
            $table->enum('scoring_method', ['equal', 'weighted'])->default('equal');
            $table->decimal('pass_score', 5, 2)->nullable()->comment('Điểm tối thiểu để đạt bài thi');
            $table->integer('max_attempts')->default(0)->comment('0: Không giới hạn lượt làm bài');
            $table->boolean('shuffle_questions')->default(true);
            $table->boolean('shuffle_options')->default(true);
            $table->enum('show_result_type', ['immediately', 'after_closed', 'no'])->default('immediately');
            $table->dateTime('start_time')->nullable();
            $table->dateTime('end_time')->nullable();
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft')->index();
            $table->boolean('is_auto_generated')->default(false)->comment('Version sau: đề ngẫu nhiên tự động');
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exams');
    }
};
