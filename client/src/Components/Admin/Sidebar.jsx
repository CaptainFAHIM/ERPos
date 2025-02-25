"use client"

import { useState, useEffect, useCallback, memo } from "react"
import { useNavigate } from "react-router-dom"
import {
  FaChevronDown,
  FaSignOutAlt,
  FaUserCircle,
  FaBell,
  FaCog,
  FaMoon,
  FaSun,
  FaSearch,
  FaHome,
  FaUsers,
  FaBox,
  FaChartBar,
  FaCreditCard,
  FaEnvelope,
  FaCalendar,
  FaGem,
} from "react-icons/fa"
import { useDispatch } from "react-redux"
import { signOut } from "../../Redux/UserSlice/UserSlice"

// Enhanced submenu with better animations and styling
const SubMenu = memo(
  ({
    subcategories,
    section,
    activeSection,
    activeSubcategory,
    handleSubcategoryClick,
    isExpanded,
    height,
    isDarkMode,
  }) => (
    <div
      className={`
      overflow-hidden transition-all duration-300 ease-in-out
      ${isExpanded ? "opacity-100" : "opacity-0"}
    `}
      style={{ maxHeight: isExpanded ? height : 0 }}
    >
      <div className="pl-4 py-2 space-y-1">
        {Object.keys(subcategories).map((subcategory) => (
          <button
            key={subcategory}
            onClick={() => handleSubcategoryClick(section, subcategory)}
            className={`
            group w-full flex items-center px-4 py-2.5 rounded-lg text-sm
            transition-all duration-200 relative
            ${
              activeSection === section && activeSubcategory === subcategory
                ? isDarkMode
                  ? "bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20 text-white font-medium"
                  : "bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 text-gray-900 font-medium"
                : isDarkMode
                  ? "text-gray-400 hover:bg-white/5 hover:text-white"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }
          `}
          >
            <div className="relative flex items-center gap-2 w-full">
              {/* Animated dot indicator */}
              <span
                className={`
                absolute left-0 w-1.5 h-1.5 rounded-full
                bg-gradient-to-r from-indigo-500 to-purple-500
                transition-all duration-300 
                ${
                  activeSection === section && activeSubcategory === subcategory
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-0"
                }
              `}
              />
              {/* Hover effect background */}
              <div
                className={`
              absolute inset-0 rounded-lg bg-gradient-to-r 
              ${
                isDarkMode
                  ? "from-indigo-600/0 via-purple-600/0 to-pink-600/0"
                  : "from-indigo-500/0 via-purple-500/0 to-pink-500/0"
              }
              opacity-0 group-hover:opacity-10 transition-opacity duration-300
            `}
              />
              <span className="ml-3 relative z-10">{subcategory}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  ),
)

SubMenu.displayName = "SubMenu"

// Default sections with icons
const defaultSections = {
  Dashboard: {
    icon: <FaHome className="w-5 h-5" />,
    subcategories: {
      Analytics: {},
      Overview: {},
      Reports: {},
    },
  },
  Users: {
    icon: <FaUsers className="w-5 h-5" />,
    subcategories: {
      "All Users": {},
      "Add User": {},
      "User Groups": {},
    },
  },
  Products: {
    icon: <FaBox className="w-5 h-5" />,
    subcategories: {
      "All Products": {},
      Categories: {},
      Inventory: {},
    },
  },
  Analytics: {
    icon: <FaChartBar className="w-5 h-5" />,
    subcategories: {
      "Real-time": {},
      Dashboard: {},
      Reports: {},
    },
  },
  Payments: {
    icon: <FaCreditCard className="w-5 h-5" />,
  },
  Messages: {
    icon: <FaEnvelope className="w-5 h-5" />,
    subcategories: {
      Inbox: {},
      Sent: {},
      Drafts: {},
    },
  },
  Calendar: {
    icon: <FaCalendar className="w-5 h-5" />,
  },
  Premium: {
    icon: <FaGem className="w-5 h-5" />,
  },
}

// Main Sidebar Component with enhanced styling and animations
export default function Sidebar({
  setActiveSection,
  setActiveSubcategory,
  sections = defaultSections,
  activeSection,
  activeSubcategory,
  isMobile,
  isOpen,
  toggleSidebar,
}) {
  const [expandedSection, setExpandedSection] = useState(null)
  const [user, setUser] = useState(null)
  const [subMenuHeights, setSubMenuHeights] = useState({})
  const [searchTerm, setSearchTerm] = useState("")
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme")
    return savedTheme ? savedTheme === "dark" : true
  })
  const navigate = useNavigate()

  // Theme toggle handler
  const toggleTheme = useCallback(() => {
    setIsDarkMode((prev) => {
      const newTheme = !prev
      localStorage.setItem("theme", newTheme ? "dark" : "light")
      return newTheme
    })
  }, [])

  // Other handlers
  const toggleSection = useCallback((section) => {
    setExpandedSection((prev) => (prev === section ? null : section))
  }, [])

  const handleSectionClick = useCallback(
    (section) => {
      if (sections[section].subcategories) {
        toggleSection(section)
      } else {
        setActiveSection(section)
        setActiveSubcategory("")
        if (isMobile) toggleSidebar()
      }
    },
    [sections, setActiveSection, setActiveSubcategory, toggleSection, isMobile, toggleSidebar],
  )

  const handleSubcategoryClick = useCallback(
    (section, subcategory) => {
      setActiveSection(section)
      setActiveSubcategory(subcategory)
      if (isMobile) toggleSidebar()
    },
    [setActiveSection, setActiveSubcategory, isMobile, toggleSidebar],
  )
  const dispatch = useDispatch()
  const handleLogout = useCallback(() => {
    
    // Remove user data from localStorage
    localStorage.removeItem("user")

    // Dispatch logout action
    dispatch(signOut())

    // Redirect to login page
    navigate("/login")
  }, [dispatch, navigate])

  // Effects
  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem("user") || '{"username": "John Doe", "role": "Admin"}')
    setUser(loggedInUser)
  }, [])

  useEffect(() => {
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

  // Filter sections based on search
  const filteredSections = Object.keys(sections).filter((section) =>
    section.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <aside
      className={`
        w-80 flex flex-col h-screen
        ${isDarkMode ? "bg-gray-900 text-white border-white/10" : "bg-white text-gray-900 border-gray-200"}
        ${isMobile ? "fixed left-0 top-0 z-40" : "sticky top-0"}
        transition-all duration-300 ease-in-out
        ${isMobile && !isOpen ? "-translate-x-full" : "translate-x-0"}
        border-r
        ${isDarkMode ? "shadow-2xl shadow-purple-500/5" : "shadow-xl shadow-gray-200/50"}
        backdrop-blur-lg
      `}
    >
      {/* User Profile Section with enhanced gradients */}
      <div
        className={`
        relative p-6 border-b
        ${isDarkMode ? "border-white/10" : "border-gray-200"}
      `}
      >
        <div className="flex items-center gap-4">
          <div className="relative group">
            {/* Animated gradient background */}
            <div
              className={`
              absolute inset-0 rounded-full
              bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500
              animate-pulse blur-md opacity-75 group-hover:opacity-100
              transition-opacity duration-300
            `}
            />
            <div
              className={`
              relative p-1 rounded-full
              ${isDarkMode ? "bg-gray-800" : "bg-white"}
              ring-2 ring-purple-500/20
            `}
            >
              <FaUserCircle size={48} className={isDarkMode ? "text-white" : "text-gray-700"} />
            </div>
            {/* Online status indicator */}
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-gray-900">
              <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold tracking-tight truncate">{user?.username || "Guest"}</h2>
            <p
              className={`
              text-sm truncate
              ${isDarkMode ? "text-gray-400" : "text-gray-600"}
            `}
            >
              {user?.role || "No Role"}
            </p>
          </div>
        </div>

        {/* Quick Actions with enhanced hover effects */}
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={toggleTheme}
            className={`
              p-2 rounded-lg transition-all duration-200
              ${
                isDarkMode
                  ? "hover:bg-white/10 text-gray-400 hover:text-white"
                  : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
              }
              hover:scale-110 transform
            `}
          >
            {isDarkMode ? <FaMoon size={20} /> : <FaSun size={20} />}
          </button>
          <div className="flex gap-2">
            <button
              className={`
              p-2 rounded-lg transition-all duration-200
              ${
                isDarkMode
                  ? "hover:bg-white/10 text-gray-400 hover:text-white"
                  : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
              }
              hover:scale-110 transform
            `}
            >
              <FaBell size={20} />
            </button>
            <button
              className={`
              p-2 rounded-lg transition-all duration-200
              ${
                isDarkMode
                  ? "hover:bg-white/10 text-gray-400 hover:text-white"
                  : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
              }
              hover:scale-110 transform
            `}
            >
              <FaCog size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Search Bar */}
      <div className="p-4">
        <div className="relative group">
          <FaSearch
            className={`
            absolute left-3 top-1/2 transform -translate-y-1/2
            ${isDarkMode ? "text-gray-400" : "text-gray-500"}
            group-hover:text-purple-500 transition-colors duration-200
          `}
          />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`
              w-full pl-10 pr-4 py-2 rounded-lg
              transition-all duration-200
              ${
                isDarkMode
                  ? "bg-gray-800/50 focus:bg-gray-800 text-white placeholder-gray-400"
                  : "bg-gray-100/50 focus:bg-gray-100 text-gray-900 placeholder-gray-500"
              }
              border-2 border-transparent focus:border-purple-500
              outline-none
              group-hover:bg-opacity-100
            `}
          />
        </div>
      </div>

      {/* Navigation with enhanced animations */}
      <nav
        className={`
        flex-1 overflow-y-auto p-4 space-y-2
        scrollbar-thin
        ${
          isDarkMode
            ? "scrollbar-thumb-purple-500 scrollbar-track-transparent"
            : "scrollbar-thumb-purple-400 scrollbar-track-gray-100"
        }
      `}
      >
        {filteredSections.map((section) => (
          <div key={section} className="select-none">
            <button
              onClick={() => handleSectionClick(section)}
              className={`
                group w-full flex items-center justify-between px-4 py-3 rounded-lg
                transition-all duration-200 ease-in-out relative overflow-hidden
                ${
                  activeSection === section
                    ? isDarkMode
                      ? "bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20 text-white"
                      : "bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 text-gray-900"
                    : isDarkMode
                      ? "text-gray-400 hover:text-white"
                      : "text-gray-600 hover:text-gray-900"
                }
              `}
            >
              {/* Hover effect background */}
              <div
                className={`
                absolute inset-0 bg-gradient-to-r
                ${
                  isDarkMode
                    ? "from-indigo-600/0 via-purple-600/0 to-pink-600/0"
                    : "from-indigo-500/0 via-purple-500/0 to-pink-500/0"
                }
                opacity-0 group-hover:opacity-10 transition-opacity duration-300
              `}
              />

              <div className="flex items-center gap-3 relative z-10">
                <span
                  className={`
                  text-lg transition-all duration-200
                  ${activeSection === section ? "scale-110" : ""}
                  group-hover:scale-110
                  ${activeSection === section && !isDarkMode ? "text-purple-600" : ""}
                `}
                >
                  {sections[section].icon}
                </span>
                <span className="font-medium">{section}</span>
              </div>

              {sections[section].subcategories && (
                <FaChevronDown
                  className={`
                  transition-transform duration-300 relative z-10
                  ${expandedSection === section ? "rotate-180" : ""}
                `}
                />
              )}
            </button>

            {/* Enhanced Submenu */}
            {sections[section].subcategories && (
              <SubMenu
                subcategories={sections[section].subcategories}
                section={section}
                activeSection={activeSection}
                activeSubcategory={activeSubcategory}
                handleSubcategoryClick={handleSubcategoryClick}
                isExpanded={expandedSection === section}
                height={subMenuHeights[section]}
                isDarkMode={isDarkMode}
              />
            )}
          </div>
        ))}
      </nav>

      {/* Enhanced Logout Button */}
      <button
        onClick={handleLogout}
        className={`
          group p-4 flex items-center justify-center gap-3
          transition-all duration-200 border-t
          relative overflow-hidden
          ${
            isDarkMode
              ? "border-white/10 text-gray-400 hover:text-white hover:bg-white/5"
              : "border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          }
        `}
      >
        {/* Hover effect background */}
        <div
          className={`
          absolute inset-0 bg-gradient-to-r
          ${
            isDarkMode
              ? "from-indigo-600/0 via-purple-600/0 to-pink-600/0"
              : "from-indigo-500/0 via-purple-500/0 to-pink-500/0"
          }
          opacity-0 group-hover:opacity-10 transition-opacity duration-300
        `}
        />

        <FaSignOutAlt className="text-lg transition-transform duration-200 group-hover:-translate-x-1 relative z-10" />
        <span className="font-medium relative z-10">Logout</span>
      </button>
    </aside>
  )
}

