<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UsersTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create doctors
        User::create([
            'name' => 'Dr. John Smith',
            'email' => 'doctor@example.com',
            'password' => Hash::make('password'),
            'role' => 'doctor',
            'avatar' => '/images/default-avatar.png',
            'details' => 'Cardiologist, 10 years experience',
        ]);

        User::create([
            'name' => 'Dr. Sarah Johnson',
            'email' => 'sarah@example.com',
            'password' => Hash::make('password'),
            'role' => 'doctor',
            'avatar' => '/images/default-avatar.png',
            'details' => 'Neurologist, 8 years experience',
        ]);

        // Create patients
        User::create([
            'name' => 'Jane Doe',
            'email' => 'patient@example.com',
            'password' => Hash::make('password'),
            'role' => 'patient',
            'avatar' => '/images/default-avatar.png',
            'details' => 'Age: 35, Last visit: 2 weeks ago',
        ]);

        User::create([
            'name' => 'Robert Brown',
            'email' => 'robert@example.com',
            'password' => Hash::make('password'),
            'role' => 'patient',
            'avatar' => '/images/default-avatar.png',
            'details' => 'Age: 52, Last visit: 3 days ago',
        ]);
    }
}
