<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exam_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_id')->constrained('exams');
            $table->foreignId('user_id')->constrained('users');
            $table->enum('status', ['in_progress', 'submitted', 'graded'])->default('in_progress')->index();
            $table->enum('mode', ['exam', 'practice'])->default('practice');
            $table->timestamp('started_at')->useCurrent();
            $table->dateTime('submitted_at')->nullable();
            $table->integer('duration_taken_seconds')->nullable();
            $table->decimal('total_score', 6, 2)->nullable();
            $table->integer('correct_count')->nullable();
            $table->integer('wrong_count')->nullable();

            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exam_attempts');
    }
};
