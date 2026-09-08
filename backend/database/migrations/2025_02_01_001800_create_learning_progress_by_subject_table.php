<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('learning_progress_by_subject', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained('subjects')->cascadeOnDelete();
            $table->integer('attempts_count')->default(0);
            $table->decimal('average_score', 6, 2)->default(0);
            $table->unique(['user_id', 'subject_id'], 'uq_user_subject_progress');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('learning_progress_by_subject');
    }
};
