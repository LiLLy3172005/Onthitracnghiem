<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('document_sections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_id')->constrained('documents')->cascadeOnDelete();
            $table->string('title', 255)->comment('Tên chương / mục / khái niệm');
            $table->text('content')->nullable();
            $table->integer('page_number')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_sections');
    }
};
