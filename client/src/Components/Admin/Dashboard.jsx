"use client"

import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa"
import Sidebar from "./Sidebar"
import { sections } from "./sections"

export default function Dashboard() {
  const navigate = useNavigate()
  const currentUser = useSelector((state) => state.user?.currentUser)

  const [activeSection, setActiveSection] = useState("Dashboard")
  const [activeSubcategory, setActiveSubcategory] = useState("")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    if (!currentUser || currentUser.role !== "admin" || !currentUser.isActive) {
      navigate("/login")
    }
  }, [currentUser, navigate])

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const renderContent = () => {
    const section = sections[activeSection]
    if (!section) return null
    return section.component || section.subcategories?.[activeSubcategory] || null
  }

  return (
    <div className="flex h-screen w-full overflow-hidden relative">
      <Sidebar
        setActiveSection={setActiveSection}
        setActiveSubcategory={setActiveSubcategory}
        sections={sections}
        activeSection={activeSection}
        activeSubcategory={activeSubcategory}
        isMobile={isMobile}
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />
      <main className="flex-1 h-screen overflow-auto p-5 bg-gray-100">{renderContent()}</main>
      <button
        className={`fixed top-4 z-50 p-2 bg-blue-700 text-white rounded-full shadow-md transition-all duration-300 ${
          isSidebarOpen ? "left-[260px]" : "left-4"
        } md:hidden`}
        onClick={toggleSidebar}
        aria-label="Toggle Sidebar"
      >
        {isSidebarOpen ? <FaAngleDoubleLeft size={22} /> : <FaAngleDoubleRight size={22} />}
      </button>
    </div>
  )
}

