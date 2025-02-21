import React, { useState, useEffect, useRef } from "react"
import { FaChevronDown, FaChevronRight, FaSignOutAlt, FaMinus, FaUserCircle } from "react-icons/fa"
import { useNavigate } from "react-router-dom"

export default function Sidebar({
  setActiveSection,
  setActiveSubcategory,
  sections,
  activeSection,
  activeSubcategory,
  isMobile,
  isOpen,
  toggleSidebar,
}) {
  const [expandedSection, setExpandedSection] = useState(null)
  const [user, setUser] = useState(null)
  const [subMenuHeights, setSubMenuHeights] = useState({})

  useEffect(() => {
    // Get user from localStorage
    const loggedInUser = JSON.parse(localStorage.getItem("user"))
    setUser(loggedInUser)
  }, [])

  const toggleSection = (section) => {
    setExpandedSection((prev) => (prev === section ? null : section))
  }

  const handleSectionClick = (section) => {
    if (sections[section].subcategories) {
      toggleSection(section)
    } else {
      setActiveSection(section)
      setActiveSubcategory("")
      if (isMobile) toggleSidebar()
    }
  }

  const handleSubcategoryClick = (section, subcategory) => {
    setActiveSection(section)
    setActiveSubcategory(subcategory)
    if (isMobile) toggleSidebar()
  }

  const navigate = useNavigate()

  const handleLogout = () => {
    navigate("/")
    localStorage.removeItem("user") // Clear user data from local storage
    setUser(null) // Reset user state
    // Redirect to login page (you may need to implement this based on your routing solution)
  }

  useEffect(() => {
    // Calculate and store the heights of all submenus
    const heights = {}
    Object.keys(sections).forEach((section) => {
      if (sections[section].subcategories) {
        const subMenuEl = document.getElementById(`submenu-${section}`)
        if (subMenuEl) {
          heights[section] = subMenuEl.scrollHeight
        }
      }
    })
    setSubMenuHeights(heights)
  }, [sections])

  return (
    <aside
      className={`w-64 bg-green-700 text-white flex flex-col h-screen ${
        isMobile ? "fixed left-0 top-0 z-40" : "sticky top-0"
      } overflow-y-auto transition-transform duration-300 ease-in-out ${
        isMobile && !isOpen ? "-translate-x-full" : "translate-x-0"
      }`}
    >
      <div className="p-5">
        {/* User Info with Icon */}
        <div className="flex items-center space-x-3 mb-6">
          <FaUserCircle size={40} className="text-white" />
          <div>
            <p className="text-lg font-bold">{user ? user.username : "Guest"}</p>
            <p className="text-sm">{user ? user.role : "No Role"}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2 flex-grow">
          {Object.keys(sections).map((section) => (
            <div key={section}>
              <button
                className={`flex items-center justify-between w-full text-left py-2 px-3 rounded hover:bg-green-800 ${
                  activeSection === section ? "bg-green-800" : ""
                }`}
                onClick={() => handleSectionClick(section)}
              >
                <div className="flex items-center space-x-2">
                  {sections[section].icon && <span>{sections[section].icon}</span>}
                  <span>{section}</span>
                </div>
                {sections[section].subcategories &&
                  (expandedSection === section ? <FaChevronDown size={18} /> : <FaChevronRight size={18} />)}
              </button>
              {sections[section].subcategories && (
                <div
                  id={`submenu-${section}`}
                  className="ml-4 mt-2 space-y-2 overflow-hidden transition-all duration-300 ease-in-out"
                  style={{
                    maxHeight: expandedSection === section ? `${subMenuHeights[section]}px` : "0px",
                    opacity: expandedSection === section ? 1 : 0,
                  }}
                >
                  {Object.keys(sections[section].subcategories).map((subcategory) => (
                    <button
                      key={subcategory}
                      className={`block w-full text-left py-1 px-3 rounded hover:bg-green-800 text-sm ${
                        activeSection === section && subcategory === activeSubcategory ? "bg-green-800" : ""
                      }`}
                      onClick={() => handleSubcategoryClick(section, subcategory)}
                    >
                      <div className="flex items-center">
                        <FaMinus size={18} className="mr-2" />
                        {subcategory}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Logout Button */}
      <button className="mt-auto p-5 flex items-center justify-center hover:bg-green-800" onClick={handleLogout}>
        <FaSignOutAlt size={18} className="mr-2" />
        Logout
      </button>
    </aside>
  )
}
