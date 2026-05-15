@extends('layouts.app')

@section('title', 'Doctor Chat - MediCare Chat')

@section('styles')
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
@endsection

@section('content')
<div class="p-4">
    <h1 class="mb-4">Patient Conversations</h1>
    
    <div class="chat-container">
        <!-- Chat Sidebar -->
        <div class="chat-sidebar">
            <div class="mb-4">
                <h5>Active Chats</h5>
                <input type="text" id="searchInput" class="form-control mb-3" placeholder="Search patients...">
            </div>
            
            <div id="chatList">
                <!-- Patient list will be loaded here -->
            </div>
        </div>
        
        <!-- Chat Window -->
        <div class="chat-window">
            <div class="d-flex align-items-center mb-4 pb-3 border-bottom" id="chatHeader">
                <div>
                    <h5 id="chatPartnerName">Select a patient to start chatting</h5>
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
            
            <div class="mt-3 d-flex gap-2">
                <button class="btn btn-outline-primary btn-sm quick-action" data-message="How are you feeling today?">
                    Check-in
                </button>
                <button class="btn btn-outline-primary btn-sm quick-action" data-message="Your test results are ready. Would you like to schedule a follow-up appointment?">
                    Test Results
                </button>
                <button class="btn btn-outline-primary btn-sm quick-action" data-message="Remember to take your medication as prescribed.">
                    Medication Reminder
                </button>
            </div>
        </div>
    </div>
</div>
@endsection

@section('scripts')
<script>
    $(document).ready(function() {
        let selectedPatientId = null;
        
        // Load patients
        function loadPatients() {
            $.ajax({
                url: '{{ route("doctor.patients") }}',
                type: 'GET',
                success: function(patients) {
                    renderPatientList(patients);
                },
                error: function(error) {
                    console.error('Error loading patients:', error);
                }
            });
        }
        
        // Render patient list
        function renderPatientList(patients) {
            const chatList = $('#chatList');
            chatList.empty();
            
            if (patients.length === 0) {
                chatList.html('<p class="text-muted">No patients found</p>');
                return;
            }
            
            patients.forEach(patient => {
                const chatItem = $('<div>')
                    .addClass('chat-item')
                    .attr('data-id', patient.id)
                    .click(function() {
                        $('.chat-item').removeClass('active');
                        $(this).addClass('active');
                        selectPatient(patient);
                    });
                
                const avatar = $('<img>')
                    .addClass('avatar')
                    .attr('src', patient.avatar || '/images/default-avatar.png')
                    .attr('alt', patient.name);
                
                const info = $('<div>').addClass('ms-2');
                const name = $('<h6>').addClass('mb-0').text(patient.name);
                const details = $('<small>').addClass('text-muted').text(patient.details || '');
                
                info.append(name, details);
                chatItem.append(avatar, info);
                chatList.append(chatItem);
            });
        }
        
        // Select a patient to chat with
        function selectPatient(patient) {
            selectedPatientId = patient.id;
            
            $('#chatPartnerName').text(patient.name);
            $('#chatPartnerDetails').text(patient.details || '');
            $('#messageInput').prop('disabled', false);
            $('#sendBtn').prop('disabled', false);
            
            loadMessages(patient.id);
        }
        
        // Load messages for a specific patient
        function loadMessages(patientId) {
            $.ajax({
                url: `/messages/${patientId}`,
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
                    .addClass(message.sender_id == {{ Auth::id() }} ? 'sent' : '')
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
            
            if (!message || !selectedPatientId) return;
            
            $.ajax({
                url: '{{ route("messages.send") }}',
                type: 'POST',
                data: {
                    content: message,
                    receiver_id: selectedPatientId
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
        
        // Search patients
        $('#searchInput').on('input', function() {
            const searchQuery = $(this).val().trim();
            
            $.ajax({
                url: '{{ route("doctor.patients") }}',
                type: 'GET',
                data: { search: searchQuery },
                success: function(patients) {
                    renderPatientList(patients);
                },
                error: function(error) {
                    console.error('Error searching patients:', error);
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
        
        // Quick action buttons
        $('.quick-action').click(function() {
            if (!selectedPatientId) return;
            
            const message = $(this).data('message');
            $('#messageInput').val(message);
            sendMessage();
        });
        
        // Initial load
        loadPatients();
    });
</script>
@endsection
