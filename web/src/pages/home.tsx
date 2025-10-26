import { useNavigate } from "react-router-dom";
import History from "../components/history.tsx";
import { demoUser } from "../data/demoData";
import { useAuth } from "../hooks/useAuth";
import { useEffect } from "react";

function Home() {
  const navigate = useNavigate();
  const { user, userData } = useAuth();

  // Log the user UID for testing - always available when auto-signed in
  useEffect(() => {
    if (user) {
      console.log("✅ User UID:", user.uid);
      console.log("✅ User Email:", user.email);
      console.log("✅ User Data:", userData);
    }
  }, [user, userData]);

  return (
    <div className="w-full bg-[#E5E7EB] min-h-screen">
      <div className="container mx-auto p-6">
        {/* Debug Info - Remove in production */}
        {user && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>User UID:</strong> {user.uid}
            </p>
            <p className="text-sm text-blue-800">
              <strong>Email:</strong> {user.email}
            </p>
            {userData?.company && (
              <p className="text-sm text-blue-800">
                <strong>Company:</strong> {userData.company}
              </p>
            )}
          </div>
        )}

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1
              className="text-3xl font-bold mb-2 text-[#003366]"
              style={{ fontFamily: "'Source Sans 3', sans-serif" }}
            >
              Dashboard
            </h1>
            <p
              className="text-[#111827]"
              style={{ fontFamily: "'Zalando Sans SemiExpanded', sans-serif" }}
            >
              Welcome to your contract management system
            </p>
          </div>

          <button
            onClick={() => navigate("/create-contract")}
            className="text-white px-6 py-3 rounded-lg transition-all duration-200 font-medium"
            style={{ backgroundColor: "#003366" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#D4AF37")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#003366")
            }
          >
            Create Contract
          </button>
        </div>

        {demoUser.pastContracts.length > 0 && (
          <div className="mt-8 bg-white rounded-lg p-4 shadow-md">
            <h2
              className="text-3xl font-semibold text-[#003366] mb-4"
              style={{ fontFamily: "'Source Sans 3', sans-serif" }}
            >
              Your Contracts
            </h2>
            <History
              contracts={demoUser.pastContracts}
              onContractClick={(contract) => {
                console.log("Clicked contract:", contract);
                // Navigate to contract details or open in new tab
                // navigate(`/view-contract/${contract.title}`);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
