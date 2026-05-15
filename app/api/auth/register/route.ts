import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { name, email, password, role } = await request.json()

    // Validate input
    if (!name || !email || !password || !role) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 })
    }

    // In a real application, you would:
    // 1. Check if the email is already registered
    // 2. Hash the password
    // 3. Store the user in your database

    // For this example, we'll just return a success message
    return NextResponse.json({
      message: "Registration successful",
      user: { name, email, role },
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ message: "An error occurred during registration" }, { status: 500 })
  }
}
