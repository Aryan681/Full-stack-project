import React, { useRef, useState, useEffect, useContext } from "react";
import axios from "axios";
import {
  Menu,
  MoreVertical,
  Trash2,
  Plus,
  Search,
  Send,
} from "lucide-react";
import { AuthContext } from "../context/AuthContext"; // Import AuthContext

// --- Constants ---
const VITE_BASE_URL = `${import.meta.env.VITE_BASE_URL}/api`;
// NOTE: AUTH_TOKEN is REMOVED and will be fetched from AuthContext.

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
}) => {
  const [historyItems, setHistoryItems] = useState([]);
  const { token } = useContext(AuthContext); // Get token from context

  useEffect(() => {
    // Only fetch if token is available
    if (!token) return;

    const fetchHistory = async () => {
      try {
        const res = await axios.get(`${VITE_BASE_URL}/history`, {
          headers: { Authorization: `Bearer ${token}` }, // Use Bearer token from context
        });
        setHistoryItems(res.data);
      } catch (err) {
        console.error("Failed to fetch chat history:", err);
      }
    };
    fetchHistory();
  }, [token]); // Rerun effect if token changes

  const handleClickHistory = (chat) => {
    // Construct messages from the single chat history item
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
    setActiveChatId(chat.id); // mark this chat as active
  };

  return (
    <div className="w-72 shrink-0 flex flex-col space-y-4 pt-14 bg-gray-100 right-1 relative rounded-2xl p-4">
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
                  <p className="text-gray-500 line-clamp-1">A: {chat.answer}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// --- Main Chat Area (No changes needed, kept for completeness) ---
const MainChatArea = ({ messages, clearConversation }) => {
  // ... (component content is unchanged)
  const [showMenu, setShowMenu] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  return (
    <div className="flex flex-col grow bg-gray-50 rounded-3xl p-6 shadow-xl mt-15 relative h-[90%]">
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-4 mb-4 flex-shrink-0">
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
      <div className="grow overflow-y-auto space-y-4 pb-[100px]">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.sender === "User" ? "justify-end" : "justify-start"}`}
          >
            <div className="flex space-x-2 max-w-[86%]">
              {msg.sender === "AI" && <div className="w-8 h-8 rounded-full">{msg.icon}</div>}
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
              {msg.sender === "User" && <div className="w-8 h-8 rounded-full">{msg.icon}</div>}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

// --- Bottom Input Area ---
const BottomInputArea = ({ messages, setMessages, documentId, setDocumentId }) => {
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef(null);
  const { token } = useContext(AuthContext); // Get token from context

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !token) return; // Prevent action if no file or no token

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

    // Optimistically add user message
    setMessages((prev) => [
      ...prev,
      {
        sender: "User",
        text: `Uploading document '${file.name}' for country '${country}'...`,
        icon:<img src="/student.png" alt="" className="w-10 h-10" /> ,
      },
    ]);

    try {
      const res = await axios.post(`${VITE_BASE_URL}/docs/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`, // Use Bearer token from context
          "Content-Type": "multipart/form-data",
        },
      });

      const { documentId: newDocumentId } = res.data;
      setDocumentId(newDocumentId);

      // Replace optimistic message with success message
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
      // Replace optimistic message with error message
      setMessages((prev) => {
        const newMessages = prev.slice(0, -1);
        newMessages.push({
          sender: "AI",
          text: `PDF upload failed: ${err.response?.data?.error || err.message}`,
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
    if (!inputText.trim() || !documentId || !token) return; // Prevent action if no text, no document, or no token

    const messageText = inputText;
    setInputText("");
    setIsSending(true);

    // Add user message and "Thinking..." AI message
    setMessages((prev) => [
      ...prev,
      {
        sender: "User",
        text: messageText,
        icon: <img src="/student.png" alt="" className="w-10 h-10" /> ,
      },
      {
        sender: "AI",
        text: "Thinking...",
        temp: true, // Mark as temporary message
        icon: <img src="/main.png" alt="" className="w-10 h-10" />,
      },
    ]);

    try {
      const res = await axios.post(
        `${VITE_BASE_URL}/chat`,
        { documentId, question: messageText },
        { headers: { Authorization: `Bearer ${token}` } } // Use Bearer token from context
      );

      // Replace temporary message with actual answer
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
      // Replace temporary message with error
      setMessages((prev) => {
        const newMessages = prev.filter((msg) => !msg.temp);
        newMessages.push({
          sender: "AI",
          text: `Failed to get answer: ${err.response?.data?.error || err.message}`,
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
    <div className="absolute bottom-0 left-0 right-0 p-6 pt-0 z-30 flex flex-col items-center">
      <form
        onSubmit={handleSendMessage}
        className="bg-white rounded-3xl p-3 shadow-2xl flex items-end w-full max-w-4xl border border-gray-200"
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
            disabled={isSending || !token} // Disable if sending or no token
          />
        </label>

        <textarea
          className="w-full text-lg resize-none border-none outline-none bg-transparent text-gray-800 self-center overflow-y-auto placeholder:text-gray-500 px-2 min-h-[48px]"
          rows="1"
          placeholder={
            !token
              ? "Log in to start a document chat" // New placeholder if not logged in
              : documentId
              ? "Ask a question about the document..."
              : "Upload a file to start a document chat"
          }
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={isSending || !documentId || !token} // Disable if sending, no doc, or no token
        ></textarea>

        <button
          type="submit"
          className={`p-2 ml-1 rounded-full flex-shrink-0 transition-colors ${
            isSending || !inputText.trim() || !documentId || !token // Check for token here too
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
  const { loading } = useContext(AuthContext); // Get loading state

  const clearConversation = () => {
    setMessages(initialChatMessages); // Revert to initial message
    setDocumentId(null);
    setActiveChatId(null);
    alert(
      "Conversation Cleared. Please upload a new document to start a chat."
    );
  };

  // Show a loading state while AuthContext is initializing
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-700">Loading user session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex justify-center items-stretch relative">
      <div className="flex w-full max-w-7xl h-[90vh] space-x-8">
        <div className="flex flex-col grow relative">
          <MainChatArea messages={messages} clearConversation={clearConversation} />
          <BottomInputArea
            messages={messages}
            setMessages={setMessages}
            documentId={documentId}
            setDocumentId={setDocumentId}
          />
        </div>

        <HistorySidebar
          activeChatId={activeChatId}
          setActiveChatId={setActiveChatId}
          setMessages={setMessages}
          setDocumentId={setDocumentId}
        />
      </div>
    </div>
  );
}