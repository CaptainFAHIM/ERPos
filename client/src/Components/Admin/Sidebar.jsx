"use client"

import { useState } from "react"
import { FaChevronDown, FaChevronRight, FaSignOutAlt, FaMinus } from "react-icons/fa"
import { motion, AnimatePresence } from "framer-motion"
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
  }

  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: "-100%" },
  }

  return (
    <AnimatePresence>
      {(!isMobile || isOpen) && (
        <motion.aside
          className={`w-64 bg-green-700 text-white flex flex-col h-screen ${
            isMobile ? "fixed left-0 top-0 z-40" : "sticky top-0"
          } overflow-y-auto`}
          initial={isMobile ? "closed" : "open"}
          animate={isMobile ? (isOpen ? "open" : "closed") : "open"}
          exit="closed"
          variants={sidebarVariants}
          transition={{ duration: 0.3 }}
        >
          <div className="p-5">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-12 h-12 bg-white rounded-full"></div>
              <div>
                <p className="text-lg font-bold">fahim1234</p>
                <p className="text-sm">Administrator</p>
              </div>
            </div>
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
                  {sections[section].subcategories && expandedSection === section && (
                    <motion.div
                      className="ml-4 mt-2 space-y-2"
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.3 }}
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
                            {expandedSection === section ? (
                              <FaMinus size={18} className="mr-2" />
                            ) : (
                              <FaChevronRight size={18} className="mr-2" />
                            )}
                            {subcategory}
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>
              ))}
            </nav>
          </div>
          <button className="mt-auto p-5 flex items-center justify-center hover:bg-green-800" onClick={handleLogout}>
            <FaSignOutAlt size={18} className="mr-2" />
            Logout
          </button>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}

