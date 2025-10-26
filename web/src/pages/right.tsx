import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Search,
  Database,
  Brain,
  FileCheck,
  BarChart3,
  MessageSquare,
  TrendingUp,
} from "lucide-react";

interface StageConfig {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

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

const stageConfig: Record<string, StageConfig> = {
  classify_question: {
    label: "Classifying request",
    icon: Brain,
    color: "blue",
  },
  init_risk: {
    label: "Extracting company details",
    icon: Search,
    color: "indigo",
  },
  fetch_external_data: {
    label: "Fetching external data",
    icon: Database,
    color: "purple",
  },
  verify_sources: {
    label: "Verifying sources",
    icon: FileCheck,
    color: "green",
  },
  store_in_vector_db: {
    label: "Storing in database",
    icon: Database,
    color: "cyan",
  },
  retrieve_relevant_context: {
    label: "Retrieving context",
    icon: Search,
    color: "orange",
  },
  generate_final_analysis: {
    label: "Generating analysis",
    icon: BarChart3,
    color: "red",
  },
  regular_chatbot: {
    label: "Processing response",
    icon: MessageSquare,
    color: "gray",
  },
};

// Processing Step Component
const ProcessingStep = ({
  stage,
  status,
  message,
}: {
  stage: string;
  status: string;
  message?: string;
}) => {
  const config = stageConfig[stage] || {
    label: stage,
    icon: Brain,
    color: "gray",
  };
  const Icon = config.icon;

  return (
    <div className="flex items-start gap-3 py-3 px-4 bg-white rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
      <div className="mt-0.5">
        {status === "processing" && (
          <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
        )}
        {status === "complete" && (
          <CheckCircle2 className="w-5 h-5 text-green-500" />
        )}
        {status === "error" && <AlertCircle className="w-5 h-5 text-red-500" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Icon className="w-4 h-4 text-gray-600 shrink-0" />
          <span
            className={`text-sm ${
              status === "processing"
                ? "text-gray-900 font-medium"
                : "text-gray-600"
            }`}
          >
            {config.label}
          </span>
        </div>
        {message && <p className="text-xs text-gray-500 ml-6">{message}</p>}
        {status === "processing" && (
          <div className="mt-2 ml-6 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 animate-pulse w-3/4 transition-all duration-300" />
          </div>
        )}
      </div>
    </div>
  );
};

interface RightProps {
  isProcessing: boolean;
  currentStages: Map<string, { status: string; message?: string }>;
  statusMessages: string[];
  riskReport: RiskReport | null;
  currentCompany: string | null;
}

function Right({
  isProcessing,
  currentStages,
  statusMessages,
  riskReport,
  currentCompany,
}: RightProps) {
  return (
    <div className="flex flex-col h-full bg-linear-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Risk Analysis</h2>
            <p className="text-xs text-gray-600">
              Real-time processing monitor
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {!isProcessing && currentStages.size === 0 && !riskReport ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-24 h-24 bg-linear-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-4">
              <BarChart3 className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Awaiting Analysis Request
            </h3>
            <p className="text-sm text-gray-600 max-w-xs">
              Ask for a risk analysis in the chat to see real-time processing
              here
            </p>
          </div>
        ) : (
          <>
            {/* Current Company Being Analyzed */}
            {currentCompany && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Search className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-900">
                    Analyzing
                  </span>
                </div>
                <p className="text-lg font-bold text-blue-700">
                  {currentCompany}
                </p>
              </div>
            )}

            {/* Processing Steps */}
            {isProcessing && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                  <span className="font-semibold text-gray-900">
                    Processing Pipeline
                  </span>
                </div>

                {Array.from(currentStages.entries()).map(([stage, data]) => (
                  <ProcessingStep
                    key={stage}
                    stage={stage}
                    status={data.status}
                    message={data.message}
                  />
                ))}
              </div>
            )}

            {/* Status Messages */}
            {statusMessages.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Progress Updates
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {statusMessages.map((msg, i) => (
                    <div
                      key={i}
                      className="text-sm text-gray-700 flex items-start gap-2 p-2 bg-gray-50 rounded"
                    >
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      <span>{msg}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Risk Report Summary */}
            {riskReport && (
              <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  <h4 className="font-semibold text-gray-900">
                    Analysis Complete
                  </h4>
                </div>

                {riskReport.assessment && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-red-50 rounded-lg p-3">
                        <div className="text-xs text-red-600 font-medium mb-1">
                          Financial Risk
                        </div>
                        <div className="text-2xl font-bold text-red-700">
                          {riskReport.assessment.financial_risk}/5
                        </div>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-3">
                        <div className="text-xs text-orange-600 font-medium mb-1">
                          Security Risk
                        </div>
                        <div className="text-2xl font-bold text-orange-700">
                          {riskReport.assessment.security_risk}/5
                        </div>
                      </div>
                      <div className="bg-yellow-50 rounded-lg p-3">
                        <div className="text-xs text-yellow-600 font-medium mb-1">
                          Reputation Risk
                        </div>
                        <div className="text-2xl font-bold text-yellow-700">
                          {riskReport.assessment.reputation_risk}/5
                        </div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3">
                        <div className="text-xs text-green-600 font-medium mb-1">
                          Resilience
                        </div>
                        <div className="text-2xl font-bold text-green-700">
                          {riskReport.assessment.resilience_strength}/5
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                      <div className="text-xs text-blue-600 font-semibold mb-1">
                        RECOMMENDATION
                      </div>
                      <div className="text-lg font-bold text-blue-900 uppercase">
                        {riskReport.assessment.overall_recommendation?.replace(
                          /_/g,
                          " "
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Right;
