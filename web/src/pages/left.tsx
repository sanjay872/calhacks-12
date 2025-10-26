import { useRef, useEffect } from "react";
import { MessageSquare, Brain, Send, Loader2 } from "lucide-react";

interface LeftProps {
  messages: Array<{
    role: "user" | "assistant";
    content: string;
    mode?: string;
  }>;
  inputValue: string;
  setInputValue: (value: string) => void;
  isProcessing: boolean;
  onSend: () => void;
}

function Left({
  messages,
  inputValue,
  setInputValue,
  isProcessing,
  onSend,
}: LeftProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatMessage = (content: string) => {
    return content.split("\n").map((line, i) => {
      if (line.startsWith("**") && line.endsWith("**")) {
        return (
          <p key={i} className="font-bold mb-2">
            {line.slice(2, -2)}
          </p>
        );
      } else if (line.startsWith("• ")) {
        return (
          <li key={i} className="ml-4 mb-1">
            {line.slice(2)}
          </li>
        );
      } else if (line.trim()) {
        return (
          <p key={i} className="mb-2">
            {line}
          </p>
        );
      }
      return <br key={i} />;
    });
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4 bg-linear-to-r from-blue-600 to-indigo-600 text-white">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Contract Risk Analyzer</h2>
            <p className="text-xs text-blue-100">Ask me about contract risks</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-20 h-20 bg-linear-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-4">
              <Brain className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Start a Conversation
            </h3>
            <p className="text-sm text-gray-600 max-w-md">
              Ask me to analyze company risks or general questions about
              contracts
            </p>
            <div className="mt-4 space-y-2 w-full max-w-md">
              <button
                onClick={() =>
                  setInputValue("Analyze Tesla with high criticality")
                }
                className="block w-full px-4 py-2 text-sm text-left bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-700 transition-colors"
              >
                💡 Analyze Tesla with high criticality
              </button>
              <button
                onClick={() => setInputValue("What can you do?")}
                className="block w-full px-4 py-2 text-sm text-left bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-700 transition-colors"
              >
                💬 What can you do?
              </button>
            </div>
          </div>
        )}

        {messages.map((message, idx) => (
          <div
            key={idx}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                message.role === "user"
                  ? "bg-linear-to-r from-blue-600 to-indigo-600 text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              <div className="text-sm">{formatMessage(message.content)}</div>
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
        <div className="flex gap-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && onSend()}
            placeholder="Ask for risk analysis or general questions..."
            disabled={isProcessing}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-200 disabled:cursor-not-allowed transition-all"
          />
          <button
            onClick={onSend}
            disabled={!inputValue.trim() || isProcessing}
            className="px-6 py-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md flex items-center gap-2"
          >
            {isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Send</span>
              </>
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 px-1">
          Press Enter to send • Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}

export default Left;
