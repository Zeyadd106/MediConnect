<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MediCare Chat</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="<?php echo e(asset('css/app.css')); ?>">
</head>
<body>
    <div class="container-fluid">
        <div class="row justify-content-center align-items-center min-vh-100">
            <div class="col-md-6 text-center">
                <h1 class="mb-4"><i class="fas fa-heartbeat me-2"></i>MediCare Chat</h1>
                <p class="mb-5">A secure platform for doctor-patient communication</p>
                <div class="d-flex justify-content-center gap-3">
                    <a href="<?php echo e(route('login')); ?>" class="btn btn-primary btn-lg">Login</a>
                    <a href="<?php echo e(route('register')); ?>" class="btn btn-outline-primary btn-lg">Register</a>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
<?php /**PATH D:\Projects Laravel\laravel-chat\laravel-chat\resources\views/welcome.blade.php ENDPATH**/ ?>