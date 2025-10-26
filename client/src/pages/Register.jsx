import React, { useLayoutEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import gsap from "gsap";

const DESKTOP_BREAKPOINT = 1024;

export default function Signup() {
  const containerRef = useRef(null);
  const coverRef = useRef(null);
  const textRef = useRef(null);
  const component = useRef(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // API call to register the user
  const registerAPI = async (name, email, password) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        return { success: true, error: null, data };
      } else {
        return { success: false, error: data.message || "Registration failed." };
      }
    } catch (err) {
      return { success: false, error: "Network error. Try again later." };
    }
  };

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
              .to(coverRef.current, { scaleX: 0, transformOrigin: "left", duration: 1 }, ">")
              .fromTo(textRef.current, { x: -100, opacity: 0 }, { x: 0, opacity: 1, duration: 1 }, "-=0.5");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { success, error } = await registerAPI(name, email, password);
    setLoading(false);

    if (success) {
      navigate("/login");
    } else {
      setError(error);
    }
  };

  return (
    <div ref={component} className="flex min-h-screen items-center justify-center bg-[rgb(7,6,6)] p-4 md:p-8">
      <div
        ref={containerRef}
        className="flex w-full max-w-6xl  lg:mt-9 flex-col lg:flex-row-reverse rounded-3xl bg-[rgb(15,15,15)]"
        style={{ boxShadow: "12px -12px 24px #080808, -12px 12px 24px #161616" }}
      >
        {/* Right Image Section */}
        <div className="relative w-full lg:w-2/5 overflow-hidden image-container-responsive rounded-t-3xl lg:rounded-r-3xl lg:rounded-t-none lg:rounded-l-none">
          <img
            src="/sign.jpeg"
            alt="Signup illustration"
            className="h-[30vh] lg:h-[80vh] w-full object-cover"
          />
          <div ref={coverRef} className="absolute top-0 left-0 h-full w-full bg-[rgb(15,15,15)]" />
        </div>

        {/* Left Form Section */}
        <div ref={textRef} className="flex w-full lg:w-3/5 flex-col items-center justify-start p-8 pt-6 lg:pt-8 text-white">
          <h2 className="mb-6 md:mb-8 text-4xl md:text-5xl font-bold">Sign Up</h2>
          <form onSubmit={handleSubmit} className="w-full max-w-sm">
            <div className="input-container relative mb-4 w-full">
              <label className="mb-2 block text-sm font-medium text-gray-400" htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-t-xl border-b border-gray-500 bg-transparent px-2 py-3 text-white outline-none hover:bg-[#49b5e01f] transition-colors duration-300"
              />
              <span className="input-border absolute bottom-0 left-0 h-[2px] w-0 bg-blue-500 transition-all duration-300"></span>
            </div>

            <div className="input-container relative mb-4 w-full">
              <label className="mb-2 block text-sm font-medium text-gray-400" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-t-xl border-b border-gray-500 bg-transparent px-2 py-3 text-white outline-none hover:bg-[#49b5e01f] transition-colors duration-300"
              />
              <span className="input-border absolute bottom-0 left-0 h-[2px] w-0 bg-blue-500 transition-all duration-300"></span>
            </div>

            <div className="input-container relative mb-6 w-full">
              <label className="mb-2 block text-sm font-medium text-gray-400" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-t-xl border-b border-gray-500 bg-transparent px-2 py-3 text-white outline-none hover:bg-[#49b5e01f] transition-colors duration-300"
              />
              <span className="input-border absolute bottom-0 left-0 h-[2px] w-0 bg-blue-500 transition-all duration-300"></span>
            </div>

            {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-blue-400 py-3 font-semibold text-white transition duration-200 hover:bg-blue-500 disabled:opacity-50"
            >
              {loading ? "Signing up..." : "Sign Up"}
            </button>
          </form>

          <p className="mt-4 text-sm text-gray-400 text-center">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-400 hover:underline">Log In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
