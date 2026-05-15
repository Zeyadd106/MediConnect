<?php $__env->startSection('title', 'Patient Chat - MediCare Chat'); ?>

<?php $__env->startSection('styles'); ?>
<style>
    .chat-container {
        height: calc(100vh - 100px);
        display: flex;
        background-color: white;
        border-radius: 15px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        margin: 20px 0;
    }
    
    .chat-sidebar {
        width: 30%;
        border-right: 2px solid #f5f8f5;
        padding: 20px;
        overflow-y: auto;
    }
    
    .chat-window {
        flex: 1;
        padding: 20px;
        display: flex;
        flex-direction: column;
    }
    
    .messages {
        flex: 1;
        overflow-y: auto;
        padding-right: 10px;
    }
    
    .chat-message {
        max-width: 70%;
        padding: 15px 20px;
        margin: 10px 0;
        border-radius: 15px;
        background-color: #f5f8f5;
    }
    
    .chat-message.sent {
        background-color: #2c4a7c;
        color: white;
        margin-left: auto;
    }
    
    .chat-item {
        display: flex;
        align-items: center;
        padding: 15px;
        margin-bottom: 10px;
        border-radius: 10px;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .chat-item:hover, .chat-item.active {
        background-color: #f5f8f5;
        transform: translateX(5px);
    }
    
    .avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        margin-right: 15px;
    }
</style>
<?php $__env->stopSection(); ?>

<?php $__env->startSection('content'); ?>
<div class="p-4">
    <h1 class="mb-4">Doctor Conversations</h1>
    
    <div class="chat-container">
        <!-- Chat Sidebar -->
        <div class="chat-sidebar">
            <div class="mb-4">
                <h5>Active Chats</h5>
                <input type="text" id="searchInput" class="form-control mb-3" placeholder="Search doctors...">
            </div>
            
            <div id="chatList">
                <!-- Doctor list will be loaded here -->
            </div>
        </div>
        
        <!-- Chat Window -->
        <div class="chat-window">
            <div class="d-flex align-items-center mb-4 pb-3 border-bottom" id="chatHeader">
                <div>
                    <h5 id="chatPartnerName">Select a doctor to start chatting</h5>
                    <small id="chatPartnerDetails" class="text-muted"></small>
                </div>
            </div>
            
            <div class="messages" id="messagesContainer">
                <!-- Messages will appear here -->
            </div>
            
            <div class="mt-auto d-flex gap-2">
                <input type="text" id="messageInput" class="form-control" placeholder="Type your message..." disabled>
                <button id="sendBtn" class="btn btn-primary" disabled>
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
        </div>
    </div>
</div>
<?php $__env->stopSection(); ?>

<?php $__env->startSection('scripts'); ?>
<script>
    $(document).ready(function() {
        let selectedDoctorId = null;
        
        // Load doctors
        function loadDoctors() {
            $.ajax({
                url: '<?php echo e(route("patient.doctors")); ?>',
                type: 'GET',
                success: function(doctors) {
                    renderDoctorList(doctors);
                },
                error: function(error) {
                    console.error('Error loading doctors:', error);
                }
            });
        }
        
        // Render doctor list
        function renderDoctorList(doctors) {
            const chatList = $('#chatList');
            chatList.empty();
            
            if (doctors.length === 0) {
                chatList.html('<p class="text-muted">No doctors found</p>');
                return;
            }
            
            doctors.forEach(doctor => {
                const chatItem = $('<div>')
                    .addClass('chat-item')
                    .attr('data-id', doctor.id)
                    .click(function() {
                        $('.chat-item').removeClass('active');
                        $(this).addClass('active');
                        selectDoctor(doctor);
                    });
                
                const avatar = $('<img>')
                    .addClass('avatar')
                    .attr('src', doctor.avatar || '/images/default-avatar.png')
                    .attr('alt', doctor.name);
                
                const info = $('<div>').addClass('ms-2');
                const name = $('<h6>').addClass('mb-0').text(doctor.name);
                const details = $('<small>').addClass('text-muted').text(doctor.details || '');
                
                info.append(name, details);
                chatItem.append(avatar, info);
                chatList.append(chatItem);
            });
        }
        
        // Select a doctor to chat with
        function selectDoctor(doctor) {
            selectedDoctorId = doctor.id;
            
            $('#chatPartnerName').text(doctor.name);
            $('#chatPartnerDetails').text(doctor.details || '');
            $('#messageInput').prop('disabled', false);
            $('#sendBtn').prop('disabled', false);
            
            loadMessages(doctor.id);
        }
        
        // Load messages for a specific doctor
        function loadMessages(doctorId) {
            $.ajax({
                url: `/messages/${doctorId}`,
                type: 'GET',
                success: function(messages) {
                    renderMessages(messages);
                },
                error: function(error) {
                    console.error('Error loading messages:', error);
                }
            });
        }
        
        // Render messages
        function renderMessages(messages) {
            const messagesContainer = $('#messagesContainer');
            messagesContainer.empty();
            
            if (messages.length === 0) {
                messagesContainer.html('<p class="text-center text-muted my-4">No messages yet. Start the conversation!</p>');
                return;
            }
            
            messages.forEach(message => {
                const messageElement = $('<div>')
                    .addClass('chat-message')
                    .addClass(message.sender_id == <?php echo e(Auth::id()); ?> ? 'sent' : '')
                    .text(message.content);
                
                messagesContainer.append(messageElement);
            });
            
            // Scroll to bottom
            messagesContainer.scrollTop(messagesContainer[0].scrollHeight);
        }
        
        // Send a message
        function sendMessage() {
            const messageInput = $('#messageInput');
            const message = messageInput.val().trim();
            
            if (!message || !selectedDoctorId) return;
            
            $.ajax({
                url: '<?php echo e(route("messages.send")); ?>',
                type: 'POST',
                data: {
                    content: message,
                    receiver_id: selectedDoctorId
                },
                success: function(response) {
                    // Add the new message to the UI
                    const messageElement = $('<div>')
                        .addClass('chat-message sent')
                        .text(message);
                    
                    $('#messagesContainer').append(messageElement);
                    
                    // Clear input and scroll to bottom
                    messageInput.val('');
                    $('#messagesContainer').scrollTop($('#messagesContainer')[0].scrollHeight);
                },
                error: function(error) {
                    console.error('Error sending message:', error);
                    alert('Failed to send message. Please try again.');
                }
            });
        }
        
        // Search doctors
        $('#searchInput').on('input', function() {
            const searchQuery = $(this).val().trim();
            
            $.ajax({
                url: '<?php echo e(route("patient.doctors")); ?>',
                type: 'GET',
                data: { search: searchQuery },
                success: function(doctors) {
                    renderDoctorList(doctors);
                },
                error: function(error) {
                    console.error('Error searching doctors:', error);
                }
            });
        });
        
        // Send message on button click
        $('#sendBtn').click(sendMessage);
        
        // Send message on Enter key
        $('#messageInput').keypress(function(e) {
            if (e.which === 13) {
                sendMessage();
            }
        });
        
        // Initial load
        loadDoctors();
    });
</script>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('layouts.app', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH D:\Projects Laravel\laravel-chat\laravel-chat\resources\views/patient/chat.blade.php ENDPATH**/ ?>