import { Link, useNavigate } from "react-router-dom";
import History from "../components/history.tsx";
import { demoUser } from "../App.tsx"
import { useAuth } from "../hooks/useAuth";
import { logOut } from "../services/auth";
import { LogOut, Building2, Mail, User } from "lucide-react";
import { useEffect, useState } from "react";
import { listFiles } from "../services/backend";


function Home() {
  const navigate = useNavigate();
  
  return (
    <div className="w-full bg-[#E5E7EB] min-h-screen">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-[#003366]" style={{ fontFamily: "'Playfair Display', serif" }}>Dashboard</h1>
            <p className="text-[#111827]" style={{ fontFamily: "'Zalando Sans SemiExpanded', sans-serif" }}>Welcome to your contract management system</p>
          </div>
          
          <button 
            onClick={() => navigate("/create-contract")}
            className="text-white px-6 py-3 rounded-lg transition-all duration-200 font-medium"
            style={{ backgroundColor: '#003366' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#D4AF37'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#003366'}
          >
            Create Contract
          </button>
        </div>
        
        {
          demoUser.pastContracts.length > 0 && (
            <div className="mt-8 bg-white rounded-lg p-4 shadow-md">
              <h2 className="text-3xl font-semibold text-[#003366] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Your Contracts</h2>
              <History
                contracts={demoUser.pastContracts} 
                onContractClick={(contract) => {
                  console.log('Clicked contract:', contract);
                  // Navigate to contract details or open in new tab
                  // navigate(`/view-contract/${contract.title}`);
                }}
              />
            </div>
          )
        }
      </div>
    </div>

  
  );
}

export default Home;
