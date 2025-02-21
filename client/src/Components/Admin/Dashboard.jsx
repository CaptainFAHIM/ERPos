import React, { useState, useEffect } from "react"
import { FaBars } from "react-icons/fa"
import Sidebar from "./Sidebar"
import { sections } from "./sections"

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState("Dashboard")
  const [activeSubcategory, setActiveSubcategory] = useState("")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
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

    if (section.component) {
      return section.component
    }

    if (section.subcategories && activeSubcategory) {
      return section.subcategories[activeSubcategory]
    }

    return null
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {isMobile && (
        <button
          className="fixed top-4 left-4 z-50 p-2 bg-green-700 text-white rounded-md"
          onClick={toggleSidebar}
          aria-label="Toggle Sidebar"
        >
          <FaBars />
        </button>
      )}
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
    </div>
  )
}
