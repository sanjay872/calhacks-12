import { useState } from "react";
import Left from "./left";
import Right from "./right";

const BACKEND_URL = "http://localhost:8000";

interface RiskAssessment {
  financial_risk: number;
  security_risk: number;
  reputation_risk: number;
  resilience_strength: number;
  overall_recommendation: string;
}

interface RiskReport {
  assessment?: RiskAssessment;
  [key: string]: unknown;
}

interface StreamEvent {
  type: string;
  stage?: string;
  message?: string;
  assistant_reply?: string;
  mode?: string;
  risk_report?: RiskReport;
  company_name?: string;
}

function CreateContract() {
  const [messages, setMessages] = useState<
    Array<{ role: "user" | "assistant"; content: string; mode?: string }>
  >([]);
  const [inputValue, setInputValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStages, setCurrentStages] = useState(
    new Map<string, { status: string; message?: string }>()
  );
  const [statusMessages, setStatusMessages] = useState<string[]>([]);
  const [riskReport, setRiskReport] = useState<RiskReport | null>(null);
  const [currentCompany, setCurrentCompany] = useState<string | null>(null);
  const [userId] = useState(() => `user_${Date.now()}`);

  const handleSend = async () => {
    if (!inputValue.trim() || isProcessing) return;

    const userMessage = inputValue;
    setInputValue("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsProcessing(true);
    setCurrentStages(new Map());
    setStatusMessages([]);
    setRiskReport(null);
    setCurrentCompany(null);

    try {
      const response = await fetch(`${BACKEND_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          userMessage: userMessage,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Response body is not readable");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const event = JSON.parse(line.slice(6));
              handleEvent(event);
            } catch (e) {
              console.error("Error parsing event:", e, line);
            }
          }
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Stream error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `❌ Connection error: ${errorMessage}\n\nPlease check if the backend is running on ${BACKEND_URL}`,
        },
      ]);
      setIsProcessing(false);
      setCurrentStages(new Map());
      setStatusMessages([]);
    }
  };

  const handleEvent = (event: StreamEvent) => {
    console.log("Event:", event);

    if (event.type === "stage_start" && event.stage) {
      setCurrentStages((prev) => {
        const newMap = new Map(prev);
        newMap.set(event.stage!, {
          status: "processing",
          message: event.message,
        });
        return newMap;
      });

      // Extract company name if available
      if (
        event.stage === "init_risk" ||
        event.stage === "fetch_external_data"
      ) {
        const companyMatch = event.message?.match(/Analyzing (\w+)/i);
        if (companyMatch) {
          setCurrentCompany(companyMatch[1]);
        }
      }
    } else if (event.type === "stage_complete" && event.stage) {
      setCurrentStages((prev) => {
        const newMap = new Map(prev);
        newMap.set(event.stage!, {
          status: "complete",
          message: event.message,
        });
        return newMap;
      });

      if (event.message) {
        setStatusMessages((prev) => [...prev, event.message!]);
      }

      // Extract company name from init_risk completion
      if (event.stage === "init_risk" && event.company_name) {
        setCurrentCompany(event.company_name);
      }
    } else if (event.type === "final") {
      const content = event.assistant_reply || "Analysis complete.";
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content,
          mode: event.mode,
        },
      ]);

      if (event.risk_report) {
        setRiskReport(event.risk_report);
      }

      setIsProcessing(false);

      // Keep stages visible for a moment before clearing
      setTimeout(() => {
        setCurrentStages(new Map());
        setStatusMessages([]);
      }, 2000);
    } else if (event.type === "error") {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `❌ Error: ${event.message}`,
        },
      ]);
      setIsProcessing(false);
      setCurrentStages(new Map());
      setStatusMessages([]);
    } else if (event.type === "done") {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Left Panel - Chat */}
      <div className="w-1/2 border-r border-gray-300 shadow-lg">
        <Left
          messages={messages}
          inputValue={inputValue}
          setInputValue={setInputValue}
          isProcessing={isProcessing}
          onSend={handleSend}
        />
      </div>

      {/* Right Panel - Risk Analysis */}
      <div className="w-1/2 shadow-lg">
        <Right
          isProcessing={isProcessing}
          currentStages={currentStages}
          statusMessages={statusMessages}
          riskReport={riskReport}
          currentCompany={currentCompany}
        />
      </div>
    </div>
  );
}

export default CreateContract;
