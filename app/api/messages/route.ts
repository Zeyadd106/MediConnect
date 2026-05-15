import { NextResponse } from "next/server"
import { cookies } from "next/headers"

// In a real application, this would be stored in a database
const messages = [
  {
    id: 1,
    senderId: 1,
    receiverId: 2,
    content: "Hello, how are you feeling today?",
    timestamp: "2023-04-15T10:30:00Z",
  },
  {
    id: 2,
    senderId: 2,
    receiverId: 1,
    content: "I'm feeling much better, thank you doctor.",
    timestamp: "2023-04-15T10:35:00Z",
  },
  {
    id: 3,
    senderId: 1,
    receiverId: 2,
    content: "Great to hear! Have you been taking your medication regularly?",
    timestamp: "2023-04-15T10:37:00Z",
  },
]

export async function GET(request: Request) {
  try {
    const sessionCookie = cookies().get("session")

    if (!sessionCookie) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const session = JSON.parse(sessionCookie.value)
    const userId = session.userId

    // Get URL parameters
    const { searchParams } = new URL(request.url)
    const chatPartnerId = searchParams.get("partnerId")

    let filteredMessages

    if (chatPartnerId) {
      // Get messages between the current user and the specified chat partner
      filteredMessages = messages.filter(
        (msg) =>
          (msg.senderId === userId && msg.receiverId === Number(chatPartnerId)) ||
          (msg.receiverId === userId && msg.senderId === Number(chatPartnerId)),
      )
    } else {
      // Get all messages involving the current user
      filteredMessages = messages.filter((msg) => msg.senderId === userId || msg.receiverId === userId)
    }

    // Sort messages by timestamp
    filteredMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

    return NextResponse.json(filteredMessages)
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ message: "An error occurred while fetching messages" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const sessionCookie = cookies().get("session")

    if (!sessionCookie) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const session = JSON.parse(sessionCookie.value)
    const { content, receiverId } = await request.json()

    if (!content || !receiverId) {
      return NextResponse.json({ message: "Message content and receiver ID are required" }, { status: 400 })
    }

    // Create a new message
    const newMessage = {
      id: messages.length + 1,
      senderId: session.userId,
      receiverId: Number(receiverId),
      content,
      timestamp: new Date().toISOString(),
    }

    // Add the message to our "database"
    messages.push(newMessage)

    return NextResponse.json(newMessage)
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ message: "An error occurred while sending the message" }, { status: 500 })
  }
}
