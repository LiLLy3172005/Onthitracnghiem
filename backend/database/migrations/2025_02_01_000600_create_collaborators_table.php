<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('collaborators', function (Blueprint $table) {
            $table->id();
            $table->foreignId('owner_instructor_id')->constrained('instructor_profiles')->cascadeOnDelete();
            $table->foreignId('member_user_id')->constrained('users')->cascadeOnDelete();
            $table->enum('permission', ['view', 'edit', 'approve'])->default('edit');
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('collaborators');
    }
};
