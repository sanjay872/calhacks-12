import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import History from "../components/history.tsx";
import { demoUser } from "../App.tsx"

function Home() {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p className="text-gray-600 mb-6">Welcome to your contract management system</p>
      
      <button 
        onClick={() => navigate("/create-contract")}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Create Contract
      </button>
      
      {
        demoUser.pastContracts.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-12 mt-12 justify-items-center">
            {demoUser.pastContracts.map((contract, index) => (
              <History key={index} contract={contract} />
            ))}
          </div>
        )
      }
    </div>

  
  );
}

export default Home;
