"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Sidebar from "@/components/sidebar"
import ChatInterface from "@/components/chat-interface"

export default function PatientChat() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in and is a patient
    const checkAuth = async () => {
      try {
        // In a real app, you would fetch the user session from the server
        const sessionCookie = document.cookie.split("; ").find((row) => row.startsWith("session="))

        if (!sessionCookie) {
          router.push("/login")
          return
        }

        const sessionData = JSON.parse(decodeURIComponent(sessionCookie.split("=")[1]))

        if (sessionData.role !== "patient") {
          router.push("/login")
          return
        }

        setUser(sessionData)
      } catch (error) {
        console.error("Auth check error:", error)
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      })
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-600 border-b-blue-600 border-l-transparent border-r-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex">
      <Sidebar role="patient" onLogout={handleLogout} />

      <div className="flex-1">
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">Doctor Conversations</h1>
          {user && <ChatInterface currentUserId={user.userId} />}
        </div>
      </div>
    </div>
  )
}
