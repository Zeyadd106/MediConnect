<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PatientController extends Controller
{
    /**
     * Constructor to check if user is a patient
     */
    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            if (!Auth::check() || Auth::user()->role !== 'patient') {
                return redirect('/login');
            }
            
            return $next($request);
        });
    }
    
    /**
     * Show the patient dashboard.
     */
    public function dashboard()
    {
        return view('patient.dashboard');
    }
    
    /**
     * Show the patient chat interface.
     */
    public function chat()
    {
        $doctors = User::where('role', 'doctor')->get();
        return view('patient.chat', compact('doctors'));
    }
    
    /**
     * Get doctors for the patient.
     */
    public function getDoctors(Request $request)
    {
        $search = $request->input('search');
        
        $query = User::where('role', 'doctor');
        
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('details', 'like', "%{$search}%");
            });
        }
        
        $doctors = $query->get();
        
        return response()->json($doctors);
    }
}
