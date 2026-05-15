"use client"

import { useState, useEffect, useRef } from "react"
import { Send } from "lucide-react"

interface User {
  id: number
  name: string
  avatar: string
  details: string
}

interface Message {
  id: number
  senderId: number
  receiverId: number
  content: string
  timestamp: string
}

interface ChatInterfaceProps {
  currentUserId: number
}

export default function ChatInterface({ currentUserId }: ChatInterfaceProps) {
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageInput, setMessageInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users")
        if (response.ok) {
          const data = await response.json()
          setUsers(data)
        }
      } catch (error) {
        console.error("Error fetching users:", error)
      }
    }

    fetchUsers()
  }, [])

  // Fetch messages when a user is selected
  useEffect(() => {
    if (selectedUser) {
      const fetchMessages = async () => {
        try {
          const response = await fetch(`/api/messages?partnerId=${selectedUser.id}`)
          if (response.ok) {
            const data = await response.json()
            setMessages(data)
          }
        } catch (error) {
          console.error("Error fetching messages:", error)
        }
      }

      fetchMessages()
    }
  }, [selectedUser])

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleUserSelect = (user: User) => {
    setSelectedUser(user)
  }

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedUser) return

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: messageInput,
          receiverId: selectedUser.id,
        }),
      })

      if (response.ok) {
        const newMessage = await response.json()
        setMessages([...messages, newMessage])
        setMessageInput("")
      }
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  const handleQuickResponse = (message: string) => {
    setMessageInput(message)
  }

  const filteredUsers = searchQuery
    ? users.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.details.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : users

  return (
    <div className="chat-container">
      {/* Chat Sidebar */}
      <div className="chat-sidebar">
        <div className="sidebar-header">
          <h3 className="mb-3">Active Chats</h3>
          <input
            type="text"
            placeholder="Search..."
            className="search-bar"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="chat-list">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className={`chat-item ${selectedUser?.id === user.id ? "bg-background-light" : ""}`}
              onClick={() => handleUserSelect(user)}
            >
              <img src={user.avatar || "/placeholder.svg"} alt={user.name} className="avatar" />
              <div className="chat-info">
                <h6 className="mb-1">{user.name}</h6>
                <small className="text-muted">{user.details}</small>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className="chat-window">
        <div className="chat-header">
          {selectedUser ? (
            <>
              <img src={selectedUser.avatar || "/placeholder.svg"} alt={selectedUser.name} className="avatar" />
              <div className="patient-info">
                <h5 className="patient-name mb-1">{selectedUser.name}</h5>
                <span className="text-muted">{selectedUser.details}</span>
              </div>
            </>
          ) : (
            <div className="patient-info">
              <h5 className="patient-name mb-1">Select a chat to start messaging</h5>
            </div>
          )}
        </div>

        <div className="messages">
          {selectedUser ? (
            messages.length > 0 ? (
              messages.map((message) => (
                <div key={message.id} className={`chat-message ${message.senderId === currentUserId ? "sent" : ""}`}>
                  {message.content}
                </div>
              ))
            ) : (
              <div className="text-center text-muted my-4">No messages yet. Start the conversation!</div>
            )
          ) : (
            <div className="text-center text-muted my-4">Select a chat from the sidebar to view messages</div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="message-box">
          <input
            type="text"
            className="message-input"
            placeholder={selectedUser ? "Type your message..." : "Select a chat to start messaging"}
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            disabled={!selectedUser}
          />
          <button className="send-btn" onClick={handleSendMessage} disabled={!selectedUser || !messageInput.trim()}>
            <Send size={18} />
          </button>
        </div>

        {selectedUser && (
          <div className="quick-actions">
            <button className="quick-action-btn" onClick={() => handleQuickResponse("How are you feeling today?")}>
              Check-in
            </button>
            <button
              className="quick-action-btn"
              onClick={() =>
                handleQuickResponse("Your test results are ready. Would you like to schedule a follow-up appointment?")
              }
            >
              Test Results
            </button>
            <button
              className="quick-action-btn"
              onClick={() => handleQuickResponse("Remember to take your medication as prescribed.")}
            >
              Medication Reminder
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
