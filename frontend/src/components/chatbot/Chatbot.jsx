import { sendMessage } from "apis";
import React, { useState } from "react";

const Chatbot = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    setMessages([...messages, { role: "user", content: input }]);

    const reply = await sendMessage(input);
    setMessages([
      ...messages,
      { role: "user", content: input },
      { role: "bot", content: reply },
    ]);

    setInput("");
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 w-[350px] border border-gray-300 rounded-lg shadow-lg bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-100 border-b border-gray-300">
        <h3 className="text-lg font-semibold text-gray-700">Chatbot</h3>
        <div className="flex space-x-2">
          <button
            onClick={handleMinimize}
            className="text-gray-600 hover:text-gray-900 focus:outline-none"
          >
            {isMinimized ? "🔼" : "🔽"}
          </button>
          <button
            onClick={handleClose}
            className="text-red-600 hover:text-red-800 focus:outline-none"
          >
            ✖
          </button>
        </div>
      </div>

      {/* Chat Content */}
      {!isMinimized && (
        <div className="p-4">
          <div className="h-72 overflow-y-auto mb-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-3 ${
                  msg.role === "user" ? "text-right" : "text-left"
                }`}
              >
                <p className="text-sm">
                  <strong className="font-medium">
                    {msg.role === "user" ? "You:" : "TechStore:"}
                  </strong>{" "}
                  {msg.content}
                </p>
              </div>
            ))}
          </div>
          <div className="flex">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSendMessage}
              className="ml-2 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot
