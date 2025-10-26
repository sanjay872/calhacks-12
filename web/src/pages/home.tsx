import { useNavigate } from "react-router-dom";
import History from "../components/history.tsx";
import { demoUser } from "../data/demoData";
import { useAuth } from "../hooks/useAuth";
import { useEffect } from "react";
import { useState } from "react";
import Contract from "../data/demoData.ts";
import { listFiles } from "@/services/backend.ts";
import {
  FileText,
  Plus,
  BarChart3,
  Shield,
  TrendingUp,
  Clock,
} from "lucide-react";

function Home() {
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  const [previousContracts] = useState<Contract[]>([]);

  // Log the user UID for testing - always available when auto-signed in
  useEffect(() => {
    if (user) {
      console.log("✅ User UID:", user.uid);
      console.log("✅ User Email:", user.email);
      console.log("✅ User Data:", userData);
    }
  }, [user, userData]);

  useEffect(() => {
    if (user) {
      listFiles(user.uid).then((data) => {
        console.log("✅ Files:", data);
      });
    }
  }, [user]);

  return (
    <div className="w-full bg-linear-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Hero Header */}
        <div className="bg-linear-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-8 mb-8 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">Contract Dashboard</h1>
              <p className="text-blue-100">
                {user?.email
                  ? `Welcome back, ${user.email.split("@")[0]}`
                  : "Manage and analyze your contracts"}
              </p>
            </div>

            <button
              onClick={() => navigate("/create-contract")}
              className="flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
              <span>Create Contract</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
     

        {/* Contracts Section */}
        {previousContracts.length > 0 || demoUser.pastContracts.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Your Contracts
              </h2>
            </div>
            <History
              contracts={demoUser.pastContracts}
              onContractClick={(contract) => {
                console.log("Clicked contract:", contract);
                // Navigate to contract details or open in new tab
                // navigate(`/view-contract/${contract.title}`);
              }}
            />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-100 text-center">
            <div className="w-20 h-20 bg-linear-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Contracts Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Get started by creating your first contract
            </p>
            <button
              onClick={() => navigate("/create-contract")}
              className="inline-flex items-center gap-2 bg-linear-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>Create Contract</span>
            </button>
          </div>
        )}

        {/* Debug Info - Remove in production */}
        {user && (
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-xs font-semibold text-blue-900 mb-2">
              Debug Info (Remove in production)
            </p>
            <div className="space-y-1 text-xs text-blue-800">
              <p>
                <strong>User UID:</strong> {user.uid}
              </p>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              {userData?.company && (
                <p>
                  <strong>Company:</strong> {userData.company}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
