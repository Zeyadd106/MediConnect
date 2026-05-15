"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Sidebar from "@/components/sidebar"

export default function PatientDashboard() {
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

      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">Patient Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">Upcoming Appointments</h2>
            <p className="text-3xl font-bold text-blue-600">1</p>
            <p className="text-sm text-gray-500 mt-2">Next: Dr. John Smith on Friday at 10:00 AM</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">Medication Reminders</h2>
            <p className="text-3xl font-bold text-blue-600">2</p>
            <p className="text-sm text-gray-500 mt-2">Next: Antibiotics at 8:00 PM</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">Unread Messages</h2>
            <p className="text-3xl font-bold text-blue-600">1</p>
            <p className="text-sm text-gray-500 mt-2">From Dr. John Smith</p>
          </div>
        </div>

        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="border-b pb-3">
              <p className="font-medium">Appointment scheduled with Dr. John Smith</p>
              <p className="text-sm text-gray-500">Yesterday at 3:45 PM</p>
            </div>
            <div className="border-b pb-3">
              <p className="font-medium">Lab results received</p>
              <p className="text-sm text-gray-500">2 days ago at 11:30 AM</p>
            </div>
            <div className="border-b pb-3">
              <p className="font-medium">Prescription refilled</p>
              <p className="text-sm text-gray-500">3 days ago at 2:15 PM</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
