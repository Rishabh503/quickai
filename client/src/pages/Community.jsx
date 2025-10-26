import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { Heart, Search, Loader2 } from "lucide-react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import { ModalCreation } from "../components/ModalCreation";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const Community = () => {
  const [creations, setCreations] = useState([]);
  const [filteredCreations, setFilteredCreations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [selectedCreation, setSelectedCreation] = useState(null);

  const { getToken } = useAuth();

  const filters = ["All", "Images", "Article"];

  const fetchCreations = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/user/get-publish-creations", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });

      if (data.success) {
        console.log("did data come ?", data.creations);
        setCreations(data.creations);
        setFilteredCreations(data.creations);
      }
    } catch (error) {
      console.log(error, "this is the error");
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (id) => {
    try {
      const { data } = await axios.post(
        "/api/user/toggle-like-creations",
        { id },
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        }
      );

      if (data.success) {
        toast.success(data.message);
        // Update likes locally
        setCreations((prev) =>
          prev.map((item) =>
            item._id === id || item.id === id
              ? { ...item, likes: data.likes }
              : item
          )
        );
        setFilteredCreations((prev) =>
          prev.map((item) =>
            item._id === id || item.id === id
              ? { ...item, likes: data.likes }
              : item
          )
        );
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to like/unlike");
      console.error(error);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    filterCreations(query, activeFilter);
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    filterCreations(searchQuery, filter);
  };

  const filterCreations = (query, filter) => {
    let filtered = creations;

    // Filter by type
    if (filter !== "All") {
      filtered = filtered.filter((item) => {
        const type = item.type?.toLowerCase() || "";
        return type.includes(filter.toLowerCase().slice(0, -1)); // Remove 's' from filter
      });
    }

    // Filter by search query
    if (query) {
      filtered = filtered.filter(
        (item) =>
          item.prompt?.toLowerCase().includes(query.toLowerCase()) ||
          item.title?.toLowerCase().includes(query.toLowerCase())
      );
    }

    setFilteredCreations(filtered);
  };

  const handletype = (creation) => {
    // console.log(creation.type, 'type of creaiton');
    const { type } = creation;
    console.log(type);
    if (type === "image") return creation.content;
    if (type === "article")
      return "https://res.cloudinary.com/dhe9p6bo0/image/upload/v1761468762/Gemini_Generated_Image_9nwu9u9nwu9u9nwu_q9dsfw.png";
    // if()
  };

  useEffect(() => {
    if (user) {
      fetchCreations();
    }
  }, [user]);

  return (
    <div className="h-full overflow-y-auto  text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Public Creations Gallery</h1>
          <p className="text-gray-400">
            Explore a diverse collection of AI-generated content shared by our
            community. Discover innovative creations and gain inspiration for
            your own projects.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search creations"
              className="w-full bg-[#2a2424] text-white placeholder-gray-500 pl-12 pr-4 py-3 rounded-lg outline-none border border-[#3a3434] focus:border-[#4a4444] transition"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-8 flex-wrap">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => handleFilterChange(filter)}
              className={`px-6 py-2 rounded-full transition ${
                activeFilter === filter
                  ? "bg-white text-black"
                  : "bg-[#2a2424] text-gray-400 hover:bg-[#3a3434]"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-gray-400" />
          </div>
        ) : filteredCreations.length > 0 ? (
          /* Gallery Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCreations.map((creation, index) => (
              <div
                key={creation._id || creation.id || index}
                onClick={() => setSelectedCreation(creation)}
                className="group relative bg-[#1a1a1a] rounded-lg overflow-hidden border border-[#2a2a2a] hover:border-[#3a3a3a] transition cursor-pointer"
              >
                {/* Image */}
                <div className="aspect-square overflow-hidden">
                  <img
                    src={handletype(creation)}
                    alt={creation.title || creation.prompt}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>

                {/* Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <p className="text-white text-sm mb-2 line-clamp-2">
                    {creation.prompt ||
                      creation.title ||
                      "AI Generated Content"}
                  </p>
                  {creation.author && (
                    <p className="text-gray-400 text-xs mb-3">
                      By {creation.author}
                    </p>
                  )}
                </div>

                {/* Info Bar */}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate mb-1">
                      {creation.prompt || "AI Creation"}
                    </h3>
                    {creation.author && (
                      <p className="text-gray-400 text-xs truncate">
                        By {creation.author}
                      </p>
                    )}
                  </div>

                  {/* Like Button */}
                  <div className="flex items-center gap-2 ml-3">
                    <span className="text-sm text-gray-400">
                      {creation.likes?.length || 0}
                    </span>
                    <Heart
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(creation._id || creation.id);
                      }}
                      className={`w-5 h-5 cursor-pointer transition-all hover:scale-110 ${
                        creation.likes?.includes(user?.id)
                          ? "fill-red-500 text-red-500"
                          : "text-gray-400 hover:text-red-400"
                      }`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Search className="w-16 h-16 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No creations found</h3>
            <p className="text-sm">
              {searchQuery || activeFilter !== "All"
                ? "Try adjusting your search or filter"
                : "Be the first to share your creation!"}
            </p>
          </div>
        )}

        {/* Pagination (optional - add if needed) */}
        {/* {filteredCreations.length > 0 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <button className="w-10 h-10 rounded-lg bg-white text-black font-semibold hover:bg-gray-200 transition">
              1
            </button>
            <button className="w-10 h-10 rounded-lg bg-[#2a2424] text-gray-400 hover:bg-[#3a3434] transition">
              2
            </button>
            <button className="w-10 h-10 rounded-lg bg-[#2a2424] text-gray-400 hover:bg-[#3a3434] transition">
              3
            </button>
            <button className="w-10 h-10 rounded-lg bg-[#2a2424] text-gray-400 hover:bg-[#3a3434] transition">
              4
            </button>
            <button className="w-10 h-10 rounded-lg bg-[#2a2424] text-gray-400 hover:bg-[#3a3434] transition">
              5
            </button>
          </div>
        )} */}
        {selectedCreation && (
  <ModalCreation
    creation={selectedCreation}
    onClose={() => setSelectedCreation(null)}
  />
)}

      </div>
    </div>
  );
};

export default Community;
