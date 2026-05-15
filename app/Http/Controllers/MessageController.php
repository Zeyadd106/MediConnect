<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MessageController extends Controller
{
    /**
     * Get messages between the authenticated user and a specific partner.
     */
    public function getMessages(Request $request, $partnerId = null)
    {
        $userId = Auth::id();
        
        if ($partnerId) {
            $messages = Message::where(function($query) use ($userId, $partnerId) {
                $query->where('sender_id', $userId)
                      ->where('receiver_id', $partnerId);
            })->orWhere(function($query) use ($userId, $partnerId) {
                $query->where('sender_id', $partnerId)
                      ->where('receiver_id', $userId);
            })->orderBy('created_at', 'asc')->get();
            
            return response()->json($messages);
        }
        
        return response()->json([]);
    }

    /**
     * Send a new message.
     */
    public function sendMessage(Request $request)
    {
        $request->validate([
            'content' => 'required|string',
            'receiver_id' => 'required|exists:users,id',
        ]);
        
        $message = Message::create([
            'sender_id' => Auth::id(),
            'receiver_id' => $request->receiver_id,
            'content' => $request->content,
        ]);
        
        return response()->json($message);
    }

    /**
     * Get chat partners for the authenticated user.
     */
    public function getChatPartners()
    {
        $user = Auth::user();
        
        if ($user->isDoctor()) {
            // Get patients who have exchanged messages with this doctor
            $patientIds = Message::where('sender_id', $user->id)
                ->orWhere('receiver_id', $user->id)
                ->pluck('sender_id')
                ->merge(Message::where('sender_id', $user->id)
                    ->orWhere('receiver_id', $user->id)
                    ->pluck('receiver_id'))
                ->unique()
                ->filter(function($id) use ($user) {
                    return $id != $user->id;
                });
            
            $patients = User::whereIn('id', $patientIds)
                ->where('role', 'patient')
                ->get();
            
            return response()->json($patients);
        } else {
            // Get doctors who have exchanged messages with this patient
            $doctorIds = Message::where('sender_id', $user->id)
                ->orWhere('receiver_id', $user->id)
                ->pluck('sender_id')
                ->merge(Message::where('sender_id', $user->id)
                    ->orWhere('receiver_id', $user->id)
                    ->pluck('receiver_id'))
                ->unique()
                ->filter(function($id) use ($user) {
                    return $id != $user->id;
                });
            
            $doctors = User::whereIn('id', $doctorIds)
                ->where('role', 'doctor')
                ->get();
            
            return response()->json($doctors);
        }
    }
}
