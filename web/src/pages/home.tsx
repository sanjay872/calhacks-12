import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import History from "../components/history";

class Contract {
  constructor(title: string, date: string, status: string) {
    this.title = title;
    this.date = date;
    this.status = status;
  }
}

const demoUser = {
  pastContracts: [
    new Contract("Contract 1", "2025-01-01", "active"),
    new Contract("Contract 2", "2025-01-02", "completed"),
    new Contract("Contract 3", "2025-01-03", "pending"),
  ]
}

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
          demoUser.pastContracts.map(History)
        )
      }
    </div>

   
  
  );
}

export default Home;
