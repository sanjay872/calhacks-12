import { useAuth } from "../hooks/useAuth";
import { logOut } from "../services/auth";
import { LogOut, Building2, Mail, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import History from "../components/history";
import { listFiles } from "../services/backend";


function Home() {
  const [contracts, setContracts] = useState<any[]>([]);

  useEffect(() => {
    const fetchContracts = async () => {
      const contracts = await listFiles();
      console.log("contracts.files in home.tsx", contracts.files);
      setContracts(contracts.files);
    };
    fetchContracts();
  }, []);



  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p className="text-gray-600 mb-6">
        Welcome to your contract management system
      </p>

      <button
        onClick={() => navigate("/create-contract")}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Create Contract
      </button>

      {contracts.length > 0 && contracts.map(History)}
    </div>
  );
}

export default Home;
