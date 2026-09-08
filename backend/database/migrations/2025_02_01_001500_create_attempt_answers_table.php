<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attempt_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('attempt_id')->constrained('exam_attempts')->cascadeOnDelete();
            $table->foreignId('question_id')->constrained('questions');
            $table->foreignId('selected_option_id')->nullable()->constrained('question_options')->nullOnDelete()
                ->comment('Dùng cho loại câu single_choice');
            $table->decimal('score_earned', 5, 2)->default(0.00);
            $table->boolean('is_correct')->nullable();
            $table->dateTime('answered_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attempt_answers');
    }
};
