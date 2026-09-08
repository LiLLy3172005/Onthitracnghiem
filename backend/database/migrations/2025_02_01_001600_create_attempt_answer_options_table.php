<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attempt_answer_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('attempt_answer_id')->constrained('attempt_answers')->cascadeOnDelete();
            $table->foreignId('selected_option_id')->constrained('question_options')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attempt_answer_options');
    }
};
