import { useRef, useEffect, useState, useCallback } from "react";
import { MdSend } from "react-icons/md";

interface LeftProps {
  initialValue: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  setMessages: (
    messages:
      | Array<{ role: "user" | "assistant"; content: string }>
      | ((
          prev: Array<{ role: "user" | "assistant"; content: string }>
        ) => Array<{ role: "user" | "assistant"; content: string }>)
  ) => void;
  setInitialValue: (initialValue: string) => void;
}

function Left({
  initialValue,
  messages,
  setMessages,
  setInitialValue,
}: LeftProps) {
  console.log(`props: initialValue = ${initialValue}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [length, setLength] = useState(messages.length);
  const MAX_CHARS = 10000;

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Optimized textarea resize handler
  const handleTextareaResize = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, []);

  const handleSend = () => {
    if (initialValue.trim()) {
      if (length === messages.length) {
        return;
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "user", content: initialValue },
        ]);
        setLength(length + 1);
        setInitialValue("");

        // Reset textarea height
        if (textareaRef.current) {
          textareaRef.current.style.height = "40px";
        }

        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content:
                "I'm here to help you create a contract. Please describe what kind of contract you need.",
            },
          ]);
        }, 200);
        setLength(length + 1);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-gray-900 justify-center items-center">
      <div className="w-[95%] h-[95%] border-2 rounded-4xl flex flex-col overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Contract Assistant
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Ask me anything about your contract
          </p>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#D4AF37] text-white mb-4">
                <span className="text-2xl">◈</span>
              </div>
              <h3 className="text-xl font-medium text-gray-800 dark:text-gray-100 mb-2">
                Start a conversation
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Type your message below to begin
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`flex gap-2 max-w-[80%] ${
                      message.role === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm ${
                        message.role === "user"
                          ? "bg-blue-500 text-white"
                          : "bg-[#D4AF37] text-white"
                      }`}
                    >
                      {message.role === "user" ? "U" : "◈"}
                    </div>

                    {/* Message Content */}
                    <div
                      className={`px-3 py-2 rounded-2xl ${
                        message.role === "user"
                          ? "bg-[#003366] text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                      }`}
                    >
                      <p className={`text-sm leading-relaxed whitespace-pre-wrap ${
                        message.role === "user" ? "break-all" : "break-words"
                      }`}>
                        {message.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {/* Auto-scroll target */}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area - Fixed at Bottom */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex flex-row items-center gap-3">
            {/* Text Input */}
            <textarea
              ref={textareaRef}
              value={initialValue}
              onChange={(e) => setInitialValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message..."
              rows={1}
              maxLength={MAX_CHARS}
              className="flex-1 px-4 py-2.5 rounded-xl border border-[#D4AF37] dark:border-[#D4AF37] bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] dark:focus:ring-[#D4AF37] resize-none text-sm custom-scrollbar"
              style={{ minHeight: "40px", maxHeight: "120px" }}
              onInput={handleTextareaResize}
            />

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={!initialValue.trim()}
              className="shrink-0 p-3 rounded-xl bg-orange-500 text-white hover:bg-orange-600 hover:shadow-lg hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:bg-orange-500 disabled:hover:scale-100 disabled:cursor-not-allowed transition-all duration-200"
            >
              <MdSend size={20} color="white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Left;
