import { useState } from "react";
import Left from "./left";
import Right from "./right";
import { Send } from "lucide-react";

function CreateContract() {
  const [messages, setMessages] = useState<
    Array<{ role: "user" | "assistant"; content: string }>
  >([]);
  const [inputValue, setInputValue] = useState("");

  const handleSend = () => {
    if (inputValue.trim()) {
      setMessages([...messages, { role: "user", content: inputValue }]);

      setInputValue("");

      // Simulate a response (no actual API call)
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "I'm here to help you create a contract. Please describe what kind of contract you need.",
          },
        ]);
      }, 500);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <div className="flex flex-col h-screen bg-linear-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        {messages.length === 0 ? (
          /* Welcome Screen with Centered Input */
          <div className="flex-1 flex flex-col items-center justify-center px-4">
            <div className="w-full max-w-3xl">
              {/* Welcome Content */}
              <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-500 text-white mb-6">
                  <span className="text-3xl">✦</span>
                </div>
                <h1 className="text-4xl font-medium text-gray-800 dark:text-gray-100 mb-4">
                  Hi, how can I help you create a contract?
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg mb-8">
                  Describe your contract needs and I'll assist you
                </p>
              </div>

              {/* Centered Input Area */}
              <div className="mb-8">
                <div className="relative flex items-end gap-2">
                  {/* Attach Button */}

                  {/* Text Input */}
                  <div className="flex-1 relative">
                    <textarea
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="How can I help you today?"
                      rows={1}
                      className="w-full px-4 py-3 pr-12 rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 resize-none overflow-hidden shadow-sm"
                      style={{ minHeight: "48px", maxHeight: "200px" }}
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = "auto";
                        target.style.height = target.scrollHeight + "px";
                      }}
                    />

                    {/* Send Button */}
                    <button
                      onClick={handleSend}
                      disabled={!inputValue.trim()}
                      className="absolute right-2 bottom-3 p-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Footer Text */}
                <p className="text-xs text-gray-500 dark:text-gray-500 text-center mt-3">
                  Contract Assistant can make mistakes. Please review important
                  information.
                </p>
              </div>

              {/* Suggestion Pills */}
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-screen bg-linear-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
            <div className="flex-1 flex overflow-hidden">
              <Left
                initialValue={inputValue}
                messages={messages}
                setMessages={setMessages}
                setInitialValue={setInputValue}
              />
              <Right />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
export default CreateContract;
