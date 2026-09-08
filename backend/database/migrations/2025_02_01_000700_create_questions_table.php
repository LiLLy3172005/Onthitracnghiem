<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subject_id')->constrained('subjects');
            $table->foreignId('topic_id')->nullable()->constrained('topics')->nullOnDelete();
            $table->text('content');
            $table->text('explanation')->nullable();
            $table->enum('difficulty', ['easy', 'medium', 'hard'])->default('medium')->index();
            $table->enum('question_type', ['single_choice', 'multiple_choice'])->default('single_choice');
            $table->enum('status', ['draft', 'pending_review', 'published', 'hidden'])->default('draft')->index();
            $table->foreignId('created_by')->constrained('users')->comment('Giảng viên tạo');
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete()->comment('Version sau: người duyệt');
            $table->timestamps();
            $table->softDeletes();

            $table->fullText('content', 'ftx_questions_content');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('questions');
    }
};
