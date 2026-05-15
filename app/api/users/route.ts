import { NextResponse } from "next/server"
import { cookies } from "next/headers"

// Mock user data for demonstration
const users = [
  {
    id: 1,
    name: "Dr. John Smith",
    email: "doctor@example.com",
    role: "doctor",
    avatar: "/placeholder.svg?height=40&width=40",
    details: "Cardiologist, 10 years experience",
  },
  {
    id: 2,
    name: "Jane Doe",
    email: "patient@example.com",
    role: "patient",
    avatar: "/placeholder.svg?height=40&width=40",
    details: "Age: 35, Last visit: 2 weeks ago",
  },
  {
    id: 3,
    name: "Dr. Sarah Johnson",
    email: "sarah@example.com",
    role: "doctor",
    avatar: "/placeholder.svg?height=40&width=40",
    details: "Neurologist, 8 years experience",
  },
  {
    id: 4,
    name: "Robert Brown",
    email: "robert@example.com",
    role: "patient",
    avatar: "/placeholder.svg?height=40&width=40",
    details: "Age: 52, Last visit: 3 days ago",
  },
]

export async function GET(request: Request) {
  try {
    const sessionCookie = cookies().get("session")

    if (!sessionCookie) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const session = JSON.parse(sessionCookie.value)
    const currentUser = users.find((user) => user.id === session.userId)

    if (!currentUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Get URL parameters
    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role")
    const search = searchParams.get("search")?.toLowerCase()

    // Filter users based on role and search query
    let filteredUsers = users.filter((user) => user.id !== currentUser.id)

    if (role) {
      filteredUsers = filteredUsers.filter((user) => user.role === role)
    } else {
      // If current user is a doctor, show only patients
      // If current user is a patient, show only doctors
      filteredUsers = filteredUsers.filter((user) => user.role !== currentUser.role)
    }

    if (search) {
      filteredUsers = filteredUsers.filter(
        (user) => user.name.toLowerCase().includes(search) || user.details.toLowerCase().includes(search),
      )
    }

    // Remove sensitive information
    const sanitizedUsers = filteredUsers.map(({ email, ...user }) => user)

    return NextResponse.json(sanitizedUsers)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ message: "An error occurred while fetching users" }, { status: 500 })
  }
}
