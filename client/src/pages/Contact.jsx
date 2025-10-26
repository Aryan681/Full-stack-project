// src/pages/Contact.jsx
import React, { useRef, useEffect, useState } from "react";
import gsap from "gsap";

export default function Contact() {
  const pageRef = useRef(null);
  const aboutRef = useRef(null);
  const formRef = useRef(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  useEffect(() => {
    // Page entrance animation
    gsap.fromTo(
      pageRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 1, ease: "power2.out" }
    );

    // Stagger animations for About & Form
    gsap.fromTo(
      [aboutRef.current, ...formRef.current.children],
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.2,
        ease: "power2.out",
      }
    );
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(
      `Message sent!\nName: ${formData.name}\nEmail: ${formData.email}\nMessage: ${formData.message}`
    );
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div
      ref={pageRef}
      className="min-h-screen bg-gray-50 p-6 lg:p-12  mt-22 lg:mt-0 flex justify-center items-start"
    >
      <div className="w-full max-w-7xl lg:mt-10 flex flex-col lg:flex-row gap-12">
        {/* About Me Section */}
        <div
          ref={aboutRef}
          className="flex-1 bg-white p-8 rounded-3xl shadow-xl flex flex-col space-y-6"
        >
          <h1 className="text-4xl font-bold text-gray-800">About Me</h1>
          <p className="text-gray-600 text-lg leading-relaxed">
            Hi, I’m Aryan Singh Naruka, a passionate full-stack developer with
            expertise in JavaScript, React, Node.js, and modern web
            technologies. I enjoy building scalable, responsive, and
            user-friendly web applications. I also participate in hackathons,
            building innovative projects, and exploring cutting-edge tech
            solutions. Let's connect and collaborate on exciting projects!
          </p>
        </div>

        {/* Contact Form Section */}
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="flex-1 bg-white p-8 rounded-3xl shadow-xl flex flex-col space-y-6"
        >
          <h2 className="text-3xl font-bold text-gray-800">Contact Me</h2>
          <p className="text-gray-600">
            Have a question or want to collaborate? Fill out the form below and
            I’ll get back to you as soon as possible.
          </p>

          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your Name"
            required
            className="p-4 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Your Email"
            required
            className="p-4 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Your Message"
            rows={6}
            required
            className="p-4 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
          />
          <button
            type="submit"
            className="bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition-all duration-300"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}
