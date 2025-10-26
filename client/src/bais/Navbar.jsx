// src/bais/Navbar.jsx
import React, { useState, useRef, useLayoutEffect, useContext } from "react";
import gsap from "gsap";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import { User, LogOut, Menu as MenuIcon, X } from "lucide-react";
import logo from "/chatbot.png";

const navigationItems = [
  { name: "Chat", id: "chat", path: "/" },
  { name: "ContactMe", id: "contact", path: "/contact" },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const initialActiveItem =
    navigationItems.find((item) => item.path === location.pathname)?.id || "home";

  const [activeItem, setActiveItem] = useState(initialActiveItem);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const indicatorRef = useRef(null);
  const itemRefs = useRef({});
  const pillRef = useRef(null);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Desktop pill animation
  useLayoutEffect(() => {
    const updateIndicator = () => {
      if (window.innerWidth < 768) return; 
      const activeElement = itemRefs.current[activeItem];
      const indicatorElement = indicatorRef.current;
      const pillElement = pillRef.current;

      if (activeElement && indicatorElement && pillElement) {
        const pillRect = pillElement.getBoundingClientRect();
        const activeRect = activeElement.getBoundingClientRect();
        const xPosition = activeRect.left - pillRect.left;
        const yPosition = activeRect.top - pillRect.top;

        gsap.to(indicatorElement, {
          x: xPosition - 7,
          y: yPosition - 7,
          width: activeRect.width + 6,
          height: activeRect.height + 6,
          duration: 0.3,
          ease: "power2.out",
        });
      }
    };

    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [activeItem]);

  React.useEffect(() => {
    const currentItem = navigationItems.find(
      (item) => item.path === location.pathname
    )?.id;
    if (currentItem && currentItem !== activeItem) setActiveItem(currentItem);
  }, [location.pathname]);

  const handleItemClick = (id, path) => {
    setActiveItem(id);
    setMobileMenuOpen(false);
    navigate(path);
  };

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
    if (!dropdownOpen) {
      gsap.fromTo(
        dropdownRef.current,
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
      );
    }
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate("/login");
  };

  // Mobile menu animation
  React.useEffect(() => {
    if (mobileMenuRef.current) {
      if (mobileMenuOpen) {
        gsap.fromTo(
          mobileMenuRef.current,
          { opacity: 0, height: 0 },
          { opacity: 1, height: "auto", duration: 0.4, ease: "power2.out" }
        );
      } else {
        gsap.to(mobileMenuRef.current, {
          opacity: 0,
          height: 0,
          duration: 0.3,
          ease: "power2.inOut",
        });
      }
    }
  }, [mobileMenuOpen]);

  const displayName = user
    ? user.name || user.email.split("@")[0].slice(0, 5)
    : null;

  return (
    <nav className="fixed top-0 left-0 w-full p-4 z-50 shadow-md lg:shadow-none bg-white lg:bg-transparent">
      <div className="relative flex items-center justify-between">
        {/* Mobile Hamburger */}
        <div className="md:hidden order-1">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>

        {/* Logo */}
        <div className="flex items-center order-2 md:order-1">
          <img src={logo} alt="Logo" className="w-12 h-12 object-contain" />
        </div>

        {/* Desktop Navigation Pill */}
        <div className="hidden md:flex relative flex-1 justify-center px-4 order-3">
          <div ref={pillRef} className="relative flex p-1 bg-white rounded-full shadow-md">
            <div
              ref={indicatorRef}
              className="absolute bg-blue-500 rounded-full pointer-events-none z-0"
              style={{ willChange: "transform, width, height" }}
            />
            {navigationItems.map((item) => (
              <button
                key={item.id}
                ref={(el) => (itemRefs.current[item.id] = el)}
                onClick={() => handleItemClick(item.id, item.path)}
                className={`relative px-6 py-2 text-sm font-medium transition-colors duration-300 z-10 ${
                  activeItem === item.id ? "text-black" : "text-gray-600 hover:text-gray-800"
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>

        {/* User/Login Section */}
        <div className="flex items-center ml-4 order-3">
          {user ? (
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="flex items-center gap-2 bg-black text-white rounded-full px-4 py-2 font-medium shadow-lg hover:bg-gray-800 transition-colors duration-300"
              >
                <User className="w-5 h-5" />
                <span className="hidden sm:inline">{displayName}</span>
              </button>
              {dropdownOpen && (
                <div
                  ref={dropdownRef}
                  className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg overflow-hidden z-20"
                >
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-gray-800 hover:bg-gray-100 transition-colors duration-200"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden md:flex bg-black text-white rounded-full px-4 py-2 font-medium shadow-lg hover:bg-gray-800 transition-colors duration-300 items-center gap-1"
            >
              <User className="w-5 h-5" /> Login
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div
        ref={mobileMenuRef}
        className="md:hidden mt-2 flex flex-col space-y-2 bg-white rounded-xl shadow-lg overflow-hidden"
        style={{ height: 0, opacity: 0 }}
      >
        {navigationItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleItemClick(item.id, item.path)}
            className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
              activeItem === item.id
                ? "bg-blue-100 text-blue-600"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            {item.name}
          </button>
        ))}

        {/* Mobile Login button if user not logged in */}
        {!user && (
          <Link
            to="/login"
            className="w-full text-left px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-800 transition-colors"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
