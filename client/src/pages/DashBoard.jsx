import React, { useEffect, useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const DashBoard = () => {
  const [creations, setCreations] = useState([]);
  const [loading, setLoading] = useState(false);
  const { getToken } = useAuth();
  const { user } = useUser();

  const getDashboardData = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/user/get-user-creations', {
        headers: { Authorization: `Bearer ${await getToken()}` }
      });

      if (data.success) {
        console.log('did data come ?', data.creations);
        setCreations(data.creations);
      }
    } catch (error) {
      console.log(error, "this is the error");
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getDashboardData();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
  };

  return (
    <div className="h-full overflow-y-auto  text-white p-8">
      <div className="max-w-5xl mx-auto">
        {/* Profile Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Profile</h1>
        </div>

      <div className="flex justify-between">
          {/* User Info Card */}
        <div className="flex items-center gap-6 mb-12">
          <img 
            src={user?.imageUrl} 
            alt={user?.fullName}
            className="w-24 h-24 rounded-full"
          />
          <div>
            <h2 className="text-2xl font-semibold mb-1">{user?.fullName}</h2>
            <p className="text-gray-400 mb-1">{user?.primaryEmailAddress?.emailAddress}</p>
            <p className="text-gray-500 text-sm">
              Joined in {new Date(user?.createdAt).getFullYear()}
            </p>
          </div>
        </div>



        {/* Usage Section */}
        <div className="mb-12 ">
          <h2 className="text-2xl font-bold mb-6">Usage</h2>
          <div className="bg-[#2a2424] flex items-center gap-2 justify-center p-6 rounded-lg">
            <p className="text-gray-400 ">Total Generations : </p>
            <h3 className="text-2xl font-bold">{creations.length}</h3>
          </div>
        </div>
      </div>

        {/* History Section */}
        <div>
          <h2 className="text-2xl font-bold mb-6">History</h2>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : creations.length > 0 ? (
            <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] overflow-hidden">
              <table className="w-full">
                <thead className="border-b border-[#2a2a2a]">
                  <tr>
                    <th className="text-left p-4 font-semibold">Date</th>
                    <th className="text-left p-4 font-semibold">Tool</th>
                    <th className="text-left p-4 font-semibold">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {creations.map((item, index) => (
                    <tr 
                      key={item._id || index} 
                      className="border-b border-[#2a2a2a] last:border-b-0"
                    >
                      <td className="p-4 text-gray-400">
                        {formatDate(item.createdAt || item.date)}
                      </td>
                      <td className="p-4 text-gray-300">
                        {item.type || item.tool || 'AI Tool'}
                      </td>
                      <td className="p-4 text-gray-400">
                        {item.prompt?.substring(0, 60) || item.description || 'Generated content'}
                        {(item.prompt?.length > 60 || item.description?.length > 60) && '...'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-12 text-center">
              <Sparkles className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No history yet</p>
              <p className="text-gray-500 text-sm mt-2">
                Start creating to see your history here
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashBoard;