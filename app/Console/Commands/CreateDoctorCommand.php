<?php

// app/Console/Commands/CreateDoctorCommand.php
namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class CreateDoctorCommand extends Command
{
    protected $signature = 'doctor:create {name} {email}';
    protected $description = 'Create a new doctor account';

    public function handle()
    {
        $name = $this->argument('name');
        $email = $this->argument('email');
        $password = $this->secret('Enter password');

        User::create([
            'name' => $name,
            'email' => $email,
            'password' => bcrypt($password),
            'role' => 'doctor',
            'avatar' => '/images/default-avatar.png',
            'details' => 'Doctor',
        ]);

        $this->info("Doctor account created for $name");
    }
}