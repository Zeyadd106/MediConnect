<?php

namespace Database\Seeders;

use App\Models\Message;
use Illuminate\Database\Seeder;

class MessagesTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Sample messages between Dr. John Smith (ID: 1) and Jane Doe (ID: 3)
        Message::create([
            'sender_id' => 1,
            'receiver_id' => 3,
            'content' => 'Hello Jane, how are you feeling today?',
            'created_at' => now()->subDays(2),
        ]);

        Message::create([
            'sender_id' => 3,
            'receiver_id' => 1,
            'content' => 'I\'m feeling much better, thank you doctor.',
            'created_at' => now()->subDays(2)->addMinutes(5),
        ]);

        Message::create([
            'sender_id' => 1,
            'receiver_id' => 3,
            'content' => 'Great to hear! Have you been taking your medication regularly?',
            'created_at' => now()->subDays(2)->addMinutes(7),
        ]);

        Message::create([
            'sender_id' => 3,
            'receiver_id' => 1,
            'content' => 'Yes, I\'ve been following your instructions carefully.',
            'created_at' => now()->subDays(2)->addMinutes(10),
        ]);

        // Sample messages between Dr. Sarah Johnson (ID: 2) and Robert Brown (ID: 4)
        Message::create([
            'sender_id' => 2,
            'receiver_id' => 4,
            'content' => 'Hello Robert, I\'ve reviewed your latest test results.',
            'created_at' => now()->subDays(1),
        ]);

        Message::create([
            'sender_id' => 4,
            'receiver_id' => 2,
            'content' => 'Thank you, Dr. Johnson. What do they show?',
            'created_at' => now()->subDays(1)->addMinutes(15),
        ]);

        Message::create([
            'sender_id' => 2,
            'receiver_id' => 4,
            'content' => 'Everything looks good. Your blood pressure has improved significantly.',
            'created_at' => now()->subDays(1)->addMinutes(20),
        ]);
    }
}
