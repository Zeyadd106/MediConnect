<div class="col-md-2 sidebar">
    <h4 class="text-center mb-4"><i class="fas fa-heartbeat me-2"></i>MediCare</h4>
    
    @if(Auth::user()->isDoctor())
        <a href="{{ route('doctor.dashboard') }}" class="{{ request()->routeIs('doctor.dashboard') ? 'active' : '' }}">
            <i class="fas fa-chart-line me-2"></i> Dashboard
        </a>
        <a href="{{ route('doctor.patients') }}" class="{{ request()->routeIs('doctor.patients') ? 'active' : '' }}">
            <i class="fas fa-hospital-user me-2"></i> Patients
        </a>
        <a href="{{ route('doctor.chat') }}" class="{{ request()->routeIs('doctor.chat') ? 'active' : '' }}">
            <i class="fas fa-comments me-2"></i> Chat
        </a>
    @else
        <a href="{{ route('patient.dashboard') }}" class="{{ request()->routeIs('patient.dashboard') ? 'active' : '' }}">
            <i class="fas fa-chart-line me-2"></i> Dashboard
        </a>
        <a href="{{ route('patient.doctors') }}" class="{{ request()->routeIs('patient.doctors') ? 'active' : '' }}">
            <i class="fas fa-user-md me-2"></i> Doctors
        </a>
        <a href="{{ route('patient.chat') }}" class="{{ request()->routeIs('patient.chat') ? 'active' : '' }}">
            <i class="fas fa-comments me-2"></i> Chat
        </a>
    @endif
    
    <form action="{{ route('logout') }}" method="POST" class="mt-auto">
        @csrf
        <button type="submit" class="btn btn-link text-white w-100 text-start">
            <i class="fas fa-sign-out-alt me-2"></i> Logout
        </button>
    </form>
</div>
