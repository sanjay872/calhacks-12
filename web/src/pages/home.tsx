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
    <div className="container mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
        <p className="text-gray-600 mb-6">Welcome to your contract management system</p>
        
        <button 
          onClick={() => navigate("/create-contract")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create Contract
        </button>
      </div>
      
      {
        demoUser.pastContracts.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Contracts</h2>
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

  
  );
}

export default Home;
