import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // In a real application, you would validate credentials against your database
    // This is a simplified example

    // Mock user data for demonstration
    const users = [
      { id: 1, name: "Dr. John Smith", email: "doctor@example.com", password: "password", role: "doctor" },
      { id: 2, name: "Jane Doe", email: "patient@example.com", password: "password", role: "patient" },
    ]

    const user = users.find((u) => u.email === email)

    if (!user || user.password !== password) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 })
    }

    // Set a session cookie
    const oneDay = 24 * 60 * 60 * 1000
    cookies().set(
      "session",
      JSON.stringify({
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }),
      {
        expires: Date.now() + oneDay,
        httpOnly: true,
        path: "/",
      },
    )

    // Return user data (excluding password)
    const { password: _, ...userData } = user

    return NextResponse.json({
      message: "Login successful",
      user: userData,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ message: "An error occurred during login" }, { status: 500 })
  }
}
