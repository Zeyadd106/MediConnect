@extends('layouts.app')

@section('title', 'Patient Dashboard - MediCare Chat')

@section('content')
<div class="p-4">
    <h1 class="mb-4">Patient Dashboard</h1>
    
    <div class="row">
        <div class="col-md-4 mb-4">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">Upcoming Appointments</h5>
                    <p class="card-text display-4">1</p>
                    <p class="text-muted">Next: Dr. John Smith on Friday at 10:00 AM</p>
                </div>
            </div>
        </div>
        
        <div class="col-md-4 mb-4">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">Medication Reminders</h5>
                    <p class="card-text display-4">2</p>
                    <p class="text-muted">Next: Antibiotics at 8:00 PM</p>
                </div>
            </div>
        </div>
        
        <div class="col-md-4 mb-4">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">Unread Messages</h5>
                    <p class="card-text display-4">1</p>
                    <p class="text-muted">
                        <a href="{{ route('patient.chat') }}">View messages</a>
                    </p>
                </div>
            </div>
        </div>
    </div>
    
    <div class="card mt-4">
        <div class="card-body">
            <h5 class="card-title">Recent Activity</h5>
            <ul class="list-group list-group-flush">
                <li class="list-group-item">
                    <p class="mb-1 fw-bold">Appointment scheduled with Dr. John Smith</p>
                    <small class="text-muted">Yesterday at 3:45 PM</small>
                </li>
                <li class="list-group-item">
                    <p class="mb-1 fw-bold">Lab results received</p>
                    <small class="text-muted">2 days ago at 11:30 AM</small>
                </li>
                <li class="list-group-item">
                    <p class="mb-1 fw-bold">Prescription refilled</p>
                    <small class="text-muted">3 days ago at 2:15 PM</small>
                </li>
            </ul>
        </div>
    </div>
</div>
@endsection
