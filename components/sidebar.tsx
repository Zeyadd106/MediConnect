"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Heart, Users, Calendar, MessageSquare, FileText, User, LayoutDashboard, LogOut } from "lucide-react"

interface SidebarProps {
  role: "doctor" | "patient"
  onLogout: () => void
}

export default function Sidebar({ role, onLogout }: SidebarProps) {
  const pathname = usePathname()

  const doctorLinks = [
    { href: "/doctor/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5 mr-2" /> },
    { href: "/doctor/patients", label: "Patients", icon: <Users className="w-5 h-5 mr-2" /> },
    { href: "/doctor/appointments", label: "Appointments", icon: <Calendar className="w-5 h-5 mr-2" /> },
    { href: "/doctor/chat", label: "Chat", icon: <MessageSquare className="w-5 h-5 mr-2" /> },
    { href: "/doctor/reports", label: "Reports", icon: <FileText className="w-5 h-5 mr-2" /> },
    { href: "/doctor/profile", label: "Profile", icon: <User className="w-5 h-5 mr-2" /> },
  ]

  const patientLinks = [
    { href: "/patient/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5 mr-2" /> },
    { href: "/patient/doctors", label: "Find Doctors", icon: <Users className="w-5 h-5 mr-2" /> },
    { href: "/patient/appointments", label: "Appointments", icon: <Calendar className="w-5 h-5 mr-2" /> },
    { href: "/patient/chat", label: "Chat", icon: <MessageSquare className="w-5 h-5 mr-2" /> },
    { href: "/patient/health", label: "Health Records", icon: <Heart className="w-5 h-5 mr-2" /> },
    { href: "/patient/profile", label: "Profile", icon: <User className="w-5 h-5 mr-2" /> },
  ]

  const links = role === "doctor" ? doctorLinks : patientLinks

  return (
    <div className="sidebar">
      <h4 className="flex items-center justify-center mb-6 text-xl font-bold">
        <Heart className="w-6 h-6 mr-2" />
        MediCare
      </h4>

      <nav>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center px-4 py-2 mb-1 transition-colors ${
              pathname === link.href ? "bg-secondary-color" : "hover:bg-secondary-color"
            }`}
          >
            {link.icon}
            {link.label}
          </Link>
        ))}

        <button
          onClick={onLogout}
          className="flex items-center w-full px-4 py-2 mt-4 text-white transition-colors hover:bg-secondary-color"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Logout
        </button>
      </nav>
    </div>
  )
}
