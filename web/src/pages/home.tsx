import { useAuth } from "../hooks/useAuth";
import { logOut } from "../services/auth";
import { useNavigate } from "react-router-dom";
import { LogOut, Building2, Mail, User } from "lucide-react";

function Home() {
  const { user, userData, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logOut();
      navigate("/signin");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">Dashboard</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>

        {/* User Info Card */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 p-8 mb-6">
          <h2 className="text-2xl font-bold text-white mb-6">
            Welcome back! 👋
          </h2>

          <div className="space-y-4">
            {/* Email */}
            <div className="flex items-center gap-4 p-4 bg-gray-900/50 rounded-lg">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Mail className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Email</p>
                <p className="text-white font-medium">{user?.email}</p>
              </div>
            </div>

            {/* Company */}
            <div className="flex items-center gap-4 p-4 bg-gray-900/50 rounded-lg">
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <Building2 className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Company</p>
                <p className="text-white font-medium">
                  {userData?.company || user?.displayName || "Not specified"}
                </p>
              </div>
            </div>

            {/* User ID */}
            <div className="flex items-center gap-4 p-4 bg-gray-900/50 rounded-lg">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <User className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">User ID</p>
                <p className="text-white font-medium text-sm break-all">
                  {user?.uid}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-700/50 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Mail className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Email Verified</p>
                <p className="text-2xl font-bold text-white">
                  {user?.emailVerified ? "Yes" : "No"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-700/50 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <User className="w-8 h-8 text-green-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Account Status</p>
                <p className="text-2xl font-bold text-green-400">Active</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-700/50 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <Building2 className="w-8 h-8 text-purple-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Organization</p>
                <p className="text-xl font-bold text-white truncate">
                  {userData?.company || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
