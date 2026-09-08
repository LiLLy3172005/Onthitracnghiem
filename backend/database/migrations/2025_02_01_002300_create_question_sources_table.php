<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('question_sources', function (Blueprint $table) {
            $table->id();
            $table->foreignId('question_id')->constrained('questions')->cascadeOnDelete();
            $table->foreignId('document_id')->constrained('documents')->cascadeOnDelete();
            $table->foreignId('document_section_id')->nullable()->constrained('document_sections')->nullOnDelete();
            $table->integer('page_number')->nullable()->comment('Vị trí trang trích xuất câu hỏi (Traceability)');
            $table->text('snippet')->nullable()->comment('Đoạn trích tài liệu tương ứng');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('question_sources');
    }
};
