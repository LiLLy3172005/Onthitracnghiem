<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $admins = [
            [
                'full_name' => 'Admin Chính',
                'email'     => 'admin@brainblitz.test',
                'password'  => 'admin123',
            ],
            [
                'full_name' => 'Admin Test 2',
                'email'     => 'admin2@brainblitz.test',
                'password'  => 'admin123',
            ],
        ];

        foreach ($admins as $data) {
            User::updateOrCreate(
                ['email' => $data['email']], // tránh tạo trùng nếu chạy seeder nhiều lần
                [
                    'full_name'         => $data['full_name'],
                    'password'          => Hash::make($data['password']),
                    'role'              => 'admin',
                    'status'            => 'active',
                    'email_verified_at' => now(),
                ]
            );
        }

        $this->command->info('Đã tạo ' . count($admins) . ' tài khoản admin test.');
    }
}