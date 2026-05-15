<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\DoctorController;
use App\Http\Controllers\PatientController;
use Illuminate\Support\Facades\Auth;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

// Public routes
Route::get('/', function () {
    return view('welcome');
});

// Authentication routes
Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login']);
Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
Route::post('/register', [AuthController::class, 'register']);
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// Protected routes
Route::middleware(['auth'])->group(function () {
    // Doctor routes
    Route::prefix('doctor')->group(function () {
        Route::get('/dashboard', [DoctorController::class, 'dashboard'])->name('doctor.dashboard');
        Route::get('/chat', [DoctorController::class, 'chat'])->name('doctor.chat');
        Route::get('/patients', [DoctorController::class, 'getPatients'])->name('doctor.patients');
    });
    
    // Patient routes
    Route::prefix('patient')->group(function () {
        Route::get('/dashboard', [PatientController::class, 'dashboard'])->name('patient.dashboard');
        Route::get('/chat', [PatientController::class, 'chat'])->name('patient.chat');
        Route::get('/doctors', [PatientController::class, 'getDoctors'])->name('patient.doctors');
    });
    
    // Message routes
    Route::get('/messages/{partnerId?}', [MessageController::class, 'getMessages'])->name('messages.get');
    Route::post('/messages', [MessageController::class, 'sendMessage'])->name('messages.send');
    Route::get('/chat-partners', [MessageController::class, 'getChatPartners'])->name('chat.partners');
});
