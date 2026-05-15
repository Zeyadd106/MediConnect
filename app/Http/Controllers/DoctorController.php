<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DoctorController extends Controller
{
    /**
     * Constructor to check if user is a doctor
     */
    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            if (!Auth::check() || Auth::user()->role !== 'doctor') {
                return redirect('/login');
            }
            
            return $next($request);
        });
    }
    
    /**
     * Show the doctor dashboard.
     */
    public function dashboard()
    {
        return view('doctor.dashboard');
    }
    
    /**
     * Show the doctor chat interface.
     */
    public function chat()
    {
        $patients = User::where('role', 'patient')->get();
        return view('doctor.chat', compact('patients'));
    }
    
    /**
     * Get patients for the doctor.
     */
    public function getPatients(Request $request)
    {
        $search = $request->input('search');
        
        $query = User::where('role', 'patient');
        
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('details', 'like', "%{$search}%");
            });
        }
        
        $patients = $query->get();
        
        return response()->json($patients);
    }
}
