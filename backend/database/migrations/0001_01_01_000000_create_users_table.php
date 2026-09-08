<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
   public function up(): void
{
    Schema::create('users', function (Blueprint $table) {
        $table->id();
       $table->string('full_name'); // <-- Đổi 'name' thành 'full_name'
        $table->string('email')->unique();
        $table->timestamp('email_verified_at')->nullable();
        $table->string('password');
        $table->string('avatar_url')->nullable();
        $table->enum('role', ['student', 'instructor', 'admin'])->default('student');
        $table->enum('status', ['active', 'locked', 'pending'])->default('active');
        $table->string('provider')->nullable(); // Phục vụ Social Login (Google)
        $table->string('provider_id')->nullable();
        $table->rememberToken();
        $table->timestamps();
    });
}

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'phone', 
                'avatar', 
                'role', 
                'status', 
                'education_level', 
                'provider', 
                'provider_id'
            ]);
        });
    }
};