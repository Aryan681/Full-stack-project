import React, { useRef, useState, useEffect, useContext } from "react";
import axios from "axios";
import {
  Menu,
  MoreVertical,
  Trash2,
  Plus,
  Search,
  Send,
  MessageCircle,
  Clock,
  X,
  ArrowLeft,
} from "lucide-react";
import gsap from "gsap";
import { AuthContext } from "../context/AuthContext";

// --- Constants ---
const VITE_BASE_URL = `${import.meta.env.VITE_BASE_URL}/api`;

// --- Initial Data ---
const initialChatMessages = [
  {
    sender: "AI",
    text: "Hello! Upload a PDF document using 'Add File' to begin a document-specific chat.",
    icon: <img src="/main.png" alt="" className="w-10 h-10" />,
  },
];

// --- History Sidebar ---
const HistorySidebar = ({
  setMessages,
  setDocumentId,
  activeChatId,
  setActiveChatId,
  mobileViewOpen,
  setMobileViewOpen,
}) => {
  const [historyItems, setHistoryItems] = useState([]);
  const { token } = useContext(AuthContext);
  const boxRef3 = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      boxRef3.current,
      { x: 100, opacity: 0 },
      { x: 0, opacity: 1, duration: 1, ease: "power2.out" }
    );
  }, []);

  useEffect(() => {
    if (!token) return;
    const fetchHistory = async () => {
      try {
        const res = await axios.get(`${VITE_BASE_URL}/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHistoryItems(res.data);
      } catch (err) {
        console.error("Failed to fetch chat history:", err);
      }
    };
    fetchHistory();
  }, [token]);

  const handleClickHistory = (chat) => {
    const messages = [
      {
        sender: "User",
        text: chat.question,
        icon: <img src="/student.png" alt="" className="w-10 h-10" />,
      },
      {
        sender: "AI",
        text: chat.answer,
        icon: <img src="/main.png" alt="" className="w-10 h-10" />,
      },
    ];
    setMessages(messages);
    setDocumentId(chat.documentId);
    setActiveChatId(chat.id);
    setMobileViewOpen(false); // close mobile sidebar
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        ref={boxRef3}
        className="hidden lg:flex w-72 shrink-0 flex-col space-y-4 pt-14 bg-gray-100 right-1 relative rounded-2xl p-4"
      >
        <div className="flex justify-between items-center mb-4 px-2">
          <h2 className="text-xl font-semibold text-gray-800">History Chat</h2>
          <div className="text-gray-500 hover:text-gray-700 cursor-pointer">
            <Menu className="w-5 h-5" />
          </div>
        </div>

        <div className="space-y-3 grow overflow-y-auto px-2">
          {historyItems.length === 0 ? (
            <p className="text-gray-500 text-sm">No chat history available.</p>
          ) : (
            historyItems.map((chat) => (
              <div
                key={chat.id}
                onClick={() => handleClickHistory(chat)}
                className={`p-3 rounded-xl border cursor-pointer transition hover:bg-gray-50 ${
                  activeChatId === chat.id
                    ? "bg-green-200 border-green-400"
                    : "bg-white border-gray-100"
                }`}
              >
                <div className="flex items-start">
                  <Search className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-500" />
                  <div className="ml-3 text-sm leading-snug">
                    <p className="text-gray-700 line-clamp-1 font-semibold">
                      Q: {chat.question}
                    </p>
                    <p className="text-gray-500 line-clamp-1">
                      A: {chat.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Mobile Full-Screen Sidebar */}
      {mobileViewOpen && (
        <div className="fixed inset-0 z-50 bg-gray-100 flex flex-col pt-16">
          <div className="flex items-center justify-between px-4 py-2 border-b bg-white shadow">
            <h2 className="text-xl font-semibold text-gray-800">
              History Chat
            </h2>
            <button
              onClick={() => setMobileViewOpen(false)}
              className="text-gray-700 hover:text-gray-900 p-2 rounded-full"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          </div>
          <div className="overflow-y-auto p-4 space-y-3 flex-1">
            {historyItems.length === 0 ? (
              <p className="text-gray-500 text-sm">
                No chat history available.
              </p>
            ) : (
              historyItems.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => handleClickHistory(chat)}
                  className={`p-3 rounded-xl border cursor-pointer transition hover:bg-gray-50 ${
                    activeChatId === chat.id
                      ? "bg-green-200 border-green-400"
                      : "bg-white border-gray-100"
                  }`}
                >
                  <div className="flex items-start">
                    <Search className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-500" />
                    <div className="ml-3 text-sm leading-snug">
                      <p className="text-gray-700 line-clamp-1 font-semibold">
                        Q: {chat.question}
                      </p>
                      <p className="text-gray-500 line-clamp-1">
                        A: {chat.answer}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
};

// --- Main Chat Area ---
const MainChatArea = ({ messages, clearConversation }) => {
  const [showMenu, setShowMenu] = useState(false);
  const messagesEndRef = useRef(null);
  const boxRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      boxRef.current,
      { x: -100, opacity: 0 },
      { x: 0, opacity: 1, duration: 1, ease: "power2.out" }
    );
  }, []);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  return (
    <div
      ref={boxRef}
      className="flex flex-col grow bg-gray-50 rounded-3xl p-2 lg:p-6 shadow-xl mt-0 relative h-full lg:h-[90%] pt-28 lg:mt-12"
    >
      {/* Header - Hidden on small */}
      <div className="hidden lg:flex justify-between items-center border-b pb-4 mb-4 shrink-0">
        <div className="flex items-center space-x-2">
          <img src="/chatbot.png" alt="" className="w-10 h-10" />
          <h2 className="text-xl font-bold text-gray-800">AbroadBot</h2>
        </div>
        <div className="relative">
          <div
            className="text-gray-500 hover:text-gray-700 cursor-pointer"
            onClick={() => setShowMenu(!showMenu)}
          >
            <MoreVertical className="w-6 h-6" />
          </div>
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-xl z-20 transition-opacity duration-300">
              <button
                className="flex items-center px-4 py-2 w-full text-sm text-gray-700 hover:bg-gray-100 rounded-xl"
                onClick={() => {
                  clearConversation();
                  setShowMenu(false);
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" /> Clear Conversation
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="grow overflow-y-auto space-y-4 pb-[120px] lg:pb-[100px]">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${
              msg.sender === "User" ? "justify-end" : "justify-start"
            }`}
          >
            <div className="flex space-x-2 max-w-[86%]">
              {msg.sender === "AI" && (
                <div className="lg:w-8 w-38 h-38 rounded-full">{msg.icon}</div>
              )}
              <div>
                {msg.text && (
                  <div
                    className={`p-4 rounded-2xl ${
                      msg.sender === "AI"
                        ? "bg-white shadow"
                        : "bg-green-500 text-white shadow"
                    } text-base leading-relaxed whitespace-pre-wrap`}
                  >
                    {msg.text}
                  </div>
                )}
              </div>
              {msg.sender === "User" && (
                <div className="w-8 h-8 rounded-full">{msg.icon}</div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

// --- Bottom Input Area ---
const BottomInputArea = ({
  messages,
  setMessages,
  documentId,
  setDocumentId,
}) => {
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef(null);
  const { token } = useContext(AuthContext);
  const boxRef2 = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      boxRef2.current,
      { x: 100, opacity: 0 },
      { x: 0, opacity: 1, duration: 1, ease: "power2.out" }
    );
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !token) return;

    const country = prompt(
      "Please enter the country for this document (required for RAG context):"
    );
    if (!country) {
      alert("Upload cancelled: Country is required.");
      e.target.value = null;
      return;
    }

    const formData = new FormData();
    formData.append("pdf", file);
    formData.append("country", country);
    setIsSending(true);

    setMessages((prev) => [
      ...prev,
      {
        sender: "User",
        text: `Uploading document '${file.name}' for country '${country}'...`,
        icon: <img src="/student.png" alt="" className="w-10 h-10" />,
      },
    ]);

    try {
      const res = await axios.post(`${VITE_BASE_URL}/docs/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      const { documentId: newDocumentId } = res.data;
      setDocumentId(newDocumentId);
      setMessages((prev) => {
        const newMessages = prev.slice(0, -1);
        newMessages.push({
          sender: "AI",
          text: `PDF uploaded successfully. You can ask any question related to the document.`,
          icon: <img src="/main.png" alt="" className="w-10 h-10" />,
        });
        return newMessages;
      });
    } catch (err) {
      console.error("PDF upload failed:", err);
      setMessages((prev) => {
        const newMessages = prev.slice(0, -1);
        newMessages.push({
          sender: "AI",
          text: `PDF upload failed: ${
            err.response?.data?.error || err.message
          }`,
          icon: <img src="/chatbot.png" alt="" className="w-10 h-10" />,
        });
        return newMessages;
      });
    } finally {
      setIsSending(false);
      e.target.value = null;
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !documentId || !token) return;

    const messageText = inputText;
    setInputText("");
    setIsSending(true);
    setMessages((prev) => [
      ...prev,
      {
        sender: "User",
        text: messageText,
        icon: <img src="/student.png" alt="" className="w-10 h-10" />,
      },
      {
        sender: "AI",
        text: "Thinking...",
        temp: true,
        icon: <img src="/main.png" alt="" className="w-10 h-10" />,
      },
    ]);

    try {
      const res = await axios.post(
        `${VITE_BASE_URL}/chat`,
        { documentId, question: messageText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages((prev) => {
        const newMessages = prev.filter((msg) => !msg.temp);
        newMessages.push({
          sender: "AI",
          text: res.data.answer,
          icon: <img src="/main.png" alt="" className="w-10 h-10" />,
        });
        return newMessages;
      });
    } catch (err) {
      console.error("Query failed:", err);
      setMessages((prev) => {
        const newMessages = prev.filter((msg) => !msg.temp);
        newMessages.push({
          sender: "AI",
          text: `Failed to get answer: ${
            err.response?.data?.error || err.message
          }`,
          icon: <img src="/main.png" alt="" className="w-10 h-10" />,
        });
        return newMessages;
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <div
      ref={boxRef2}
      className="fixed lg:absolute bottom-0 left-0 right-0 p-4 lg:p-6 lg:pt-0 z-30 flex flex-col items-center"
    >
      <form
        onSubmit={handleSendMessage}
        className="bg-white rounded-3xl p-3 shadow-2xl flex items-end w-full max-w-full lg:max-w-4xl border border-gray-200"
      >
        <label
          className={`flex-shrink-0 cursor-pointer p-2 rounded-full text-gray-500 ${
            isSending || !token ? "opacity-50" : "hover:bg-gray-100"
          }`}
        >
          <Plus className="w-6 h-6" />
          <input
            ref={fileInputRef}
            type="file"
            name="pdf"
            accept="application/pdf"
            className="hidden"
            onChange={handleFileChange}
            disabled={isSending || !token}
          />
        </label>

        <textarea
          className="w-full text-lg resize-none border-none outline-none bg-transparent text-gray-800 self-center overflow-y-auto placeholder:text-gray-500 px-2 min-h-[48px]"
          rows="1"
          placeholder={
            !token
              ? "Log in to start a document chat"
              : documentId
              ? "Ask a question about the document..."
              : "Upload a file to start a document chat"
          }
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={isSending || !documentId || !token}
        ></textarea>

        <button
          type="submit"
          className={`p-2 ml-1 rounded-full flex-shrink-0 transition-colors ${
            isSending || !inputText.trim() || !documentId || !token
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-black text-white hover:bg-gray-800"
          }`}
          disabled={isSending || !inputText.trim() || !documentId || !token}
        >
          <Send className="w-6 h-6" />
        </button>
      </form>
      {!token && (
        <p className="text-sm text-red-500 mt-2">
          You must be logged in to upload documents or send messages.
        </p>
      )}
    </div>
  );
};

// --- Main Chat Component ---
export default function Chat() {
  const [messages, setMessages] = useState(initialChatMessages);
  const [documentId, setDocumentId] = useState(null);
  const [activeChatId, setActiveChatId] = useState(null);
  const { loading } = useContext(AuthContext);
  const [fabOpen, setFabOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const clearConversation = () => {
    setMessages(initialChatMessages);
    setDocumentId(null);
    setActiveChatId(null);
    alert(
      "Conversation Cleared. Please upload a new document to start a chat."
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-700">Loading user session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-0 lg:p-8 flex justify-center items-stretch relative">
      <div className="flex w-full lg:max-w-7xl h-screen lg:h-[90vh] space-x-0 lg:space-x-8">
        <div className="flex flex-col grow relative w-full">
          <MainChatArea
            messages={messages}
            clearConversation={clearConversation}
          />
          <BottomInputArea
            messages={messages}
            setMessages={setMessages}
            documentId={documentId}
            setDocumentId={setDocumentId}
          />

          {/* Floating Button - Mobile Only */}
          <div className="lg:hidden fixed bottom-38 right-6 z-50">
            <div className="relative">
              {fabOpen && (
                <div className="absolute bottom-14 right-0 flex flex-col space-y-3 items-end transform origin-bottom-right transition-all duration-300">
                  <button
                    onClick={clearConversation}
                    className="bg-green-500 p-3 rounded-full shadow-lg text-white hover:bg-green-600 transition"
                  >
                    <MessageCircle className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => setMobileSidebarOpen(true)}
                    className="bg-blue-500 p-3 rounded-full shadow-lg text-white hover:bg-blue-600 transition"
                  >
                    <Clock className="w-6 h-6" />
                  </button>
                </div>
              )}

              <button
                onClick={() => setFabOpen(!fabOpen)}
                className="bg-black p-4 rounded-full text-white shadow-lg hover:bg-gray-800 transition transform"
              >
                {fabOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Plus className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        <HistorySidebar
          activeChatId={activeChatId}
          setActiveChatId={setActiveChatId}
          setMessages={setMessages}
          setDocumentId={setDocumentId}
          mobileViewOpen={mobileSidebarOpen}
          setMobileViewOpen={setMobileSidebarOpen}
        />
      </div>
    </div>
  );
}
