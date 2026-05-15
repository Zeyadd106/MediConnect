<div class="col-md-2 sidebar">
    <h4 class="text-center mb-4"><i class="fas fa-heartbeat me-2"></i>MediCare</h4>
    
    <?php if(Auth::user()->isDoctor()): ?>
        <a href="<?php echo e(route('doctor.dashboard')); ?>" class="<?php echo e(request()->routeIs('doctor.dashboard') ? 'active' : ''); ?>">
            <i class="fas fa-chart-line me-2"></i> Dashboard
        </a>
        <a href="<?php echo e(route('doctor.patients')); ?>" class="<?php echo e(request()->routeIs('doctor.patients') ? 'active' : ''); ?>">
            <i class="fas fa-hospital-user me-2"></i> Patients
        </a>
        <a href="<?php echo e(route('doctor.chat')); ?>" class="<?php echo e(request()->routeIs('doctor.chat') ? 'active' : ''); ?>">
            <i class="fas fa-comments me-2"></i> Chat
        </a>
    <?php else: ?>
        <a href="<?php echo e(route('patient.dashboard')); ?>" class="<?php echo e(request()->routeIs('patient.dashboard') ? 'active' : ''); ?>">
            <i class="fas fa-chart-line me-2"></i> Dashboard
        </a>
        <a href="<?php echo e(route('patient.doctors')); ?>" class="<?php echo e(request()->routeIs('patient.doctors') ? 'active' : ''); ?>">
            <i class="fas fa-user-md me-2"></i> Doctors
        </a>
        <a href="<?php echo e(route('patient.chat')); ?>" class="<?php echo e(request()->routeIs('patient.chat') ? 'active' : ''); ?>">
            <i class="fas fa-comments me-2"></i> Chat
        </a>
    <?php endif; ?>
    
    <form action="<?php echo e(route('logout')); ?>" method="POST" class="mt-auto">
        <?php echo csrf_field(); ?>
        <button type="submit" class="btn btn-link text-white w-100 text-start">
            <i class="fas fa-sign-out-alt me-2"></i> Logout
        </button>
    </form>
</div>
<?php /**PATH D:\Projects Laravel\laravel-chat\laravel-chat\resources\views/layouts/sidebar.blade.php ENDPATH**/ ?>