<?php $__env->startSection('title', 'Doctor Dashboard - MediCare Chat'); ?>

<?php $__env->startSection('content'); ?>
<div class="p-4">
    <h1 class="mb-4">Doctor Dashboard</h1>
    
    <div class="row">
        <div class="col-md-4 mb-4">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">Upcoming Appointments</h5>
                    <p class="card-text display-4">5</p>
                    <p class="text-muted">Next: Jane Doe at 2:30 PM</p>
                </div>
            </div>
        </div>
        
        <div class="col-md-4 mb-4">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">Active Patients</h5>
                    <p class="card-text display-4">12</p>
                    <p class="text-muted">2 new this week</p>
                </div>
            </div>
        </div>
        
        <div class="col-md-4 mb-4">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">Unread Messages</h5>
                    <p class="card-text display-4">3</p>
                    <p class="text-muted">
                        <a href="<?php echo e(route('doctor.chat')); ?>">View messages</a>
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
                    <p class="mb-1 fw-bold">Appointment completed with Robert Brown</p>
                    <small class="text-muted">Today at 10:30 AM</small>
                </li>
                <li class="list-group-item">
                    <p class="mb-1 fw-bold">New message from Jane Doe</p>
                    <small class="text-muted">Yesterday at 4:15 PM</small>
                </li>
                <li class="list-group-item">
                    <p class="mb-1 fw-bold">Prescription renewed for Emily Wilson</p>
                    <small class="text-muted">Yesterday at 2:00 PM</small>
                </li>
            </ul>
        </div>
    </div>
</div>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('layouts.app', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\xampp\htdocs\laravel-chat\resources\views/doctor/dashboard.blade.php ENDPATH**/ ?>