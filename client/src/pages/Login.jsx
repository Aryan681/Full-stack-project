import React, { useLayoutEffect, useRef, useState, useContext } from "react";
import gsap from "gsap";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx"; // ✅ Import AuthContext

const DESKTOP_BREAKPOINT = 1024;

export default function Login() {
  const containerRef = useRef(null);
  const coverRef = useRef(null);
  const textRef = useRef(null);
  const component = useRef(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { user, login } = useContext(AuthContext); // ✅ Access login function and current user

  // 🔹 Redirect if already logged in
  useLayoutEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // API login function
  const loginAPI = async (email, password) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        return { success: true, error: null, data };
      } else {
        return { success: false, error: data.message || "Login failed." };
      }
    } catch (err) {
      return { success: false, error: "Network error. Try again later." };
    }
  };

  // GSAP animations
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(containerRef.current, { opacity: 0 });

      gsap.matchMedia().add(
        {
          isDesktop: `(min-width: ${DESKTOP_BREAKPOINT}px)`,
          isMobile: `(max-width: ${DESKTOP_BREAKPOINT - 1}px)`,
        },
        (context) => {
          const { isDesktop, isMobile } = context.conditions;

          if (isDesktop) {
            const tl = gsap.timeline({ defaults: { duration: 1, ease: "power2.out" } });
            tl.fromTo(containerRef.current, { y: 100, opacity: 0 }, { y: 0, opacity: 1 })
              .to(coverRef.current, { scaleX: 0, transformOrigin: "right", duration: 1.2 }, ">")
              .fromTo(textRef.current, { x: 100, opacity: 0 }, { x: 0, opacity: 1, duration: 1 }, "-=0.7");
          }

          if (isMobile) {
            const tl = gsap.timeline({ defaults: { duration: 0.8, ease: "power2.out" } });
            tl.fromTo(containerRef.current, { x: -50, opacity: 0 }, { x: 0, opacity: 1 })
              .set(coverRef.current, { scaleX: 0, duration: 0 }, "<");
          }
        }
      );
    }, component);

    return () => ctx.revert();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { success, error: loginError, data } = await loginAPI(email, password);
    setLoading(false);

    if (success) {
      // ✅ Corrected: pass object with userData + token to AuthContext
      login({ userData: data.user, token: data.token });
      navigate("/chat"); // redirect to home/dashboard
    } else {
      setError(loginError);
    }
  };

  return (
    <div ref={component} className="flex min-h-screen items-center justify-center bg-[rgb(7,6,6)] p-4 md:p-8">
      <div
        ref={containerRef}
        className="flex w-full max-w-6xl flex-col lg:mt-9 lg:flex-row rounded-3xl bg-[rgb(15,15,15)]"
        style={{ boxShadow: "12px -12px 24px #080808, -12px 12px 24px #161616" }}
      >
        {/* Left Image Section */}
        <div className="relative w-full lg:w-2/5 overflow-hidden image-container-responsive rounded-t-3xl lg:rounded-l-3xl lg:rounded-t-none">
          <img
            src="/login.jpeg"
            alt="Abstract crystal or geode"
            className="h-[30vh] lg:h-[80vh] w-full object-cover"
          />
          <div ref={coverRef} className="absolute top-0 left-0 h-full w-full bg-[rgb(15,15,15)]" />
        </div>

        {/* Right Form Section */}
        <div ref={textRef} className="flex w-full lg:w-3/5 flex-col items-center justify-start p-8 pt-6 lg:pt-8 text-white">
          <h2 className="mb-6 md:mb-8 text-4xl md:text-5xl font-bold">Login</h2>

          <form onSubmit={handleSubmit} className="w-full max-w-sm">
            <div className="input-container relative mb-4 w-full">
              <label className="mb-2 block text-sm font-medium text-gray-400" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-t-xl border-b border-gray-500 bg-transparent px-2 py-3 text-white outline-none transition-colors duration-300 hover:bg-[#49b5e01f]"
              />
            </div>

            <div className="input-container relative mb-6 w-full">
              <label className="mb-2 block text-sm font-medium text-gray-400" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-t-xl border-b border-gray-500 bg-transparent px-2 py-3 text-white outline-none transition-colors duration-300 hover:bg-[#49b5e01f]"
              />
            </div>

            {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-blue-400 py-3 font-semibold text-white transition duration-200 hover:bg-blue-500 disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>

          <p className="mt-4 text-sm text-gray-400 text-center">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-400 hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
