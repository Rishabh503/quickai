import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { Edit, Hash, Sparkles } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";
import Markdown from "react-markdown";
axios.defaults.baseUrl = import.meta.env.VITE_BASE_URL;
const BlogTitles = () => {
  const blogCategories = [
    "General",
    "Technology",
    "Business",
    "Health",
    "Lifestyle",
    "Education",
    "travel",
    "food",
  ];
  const [selectedCategory, setSelectedCategory] = useState("General");
  const [input, setInput] = useState("");
  const { getToken } = useAuth();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const prompt = `write an blog title  about ${input} in ${selectedCategory}`;
      const { data } = await axios.post(
        "/api/ai/generate-blog-title",
        {
          prompt,
        },
        {
          headers: { Authorization: `Bearer ${await getToken()}` },
        }
      );

      if (data.success) {
        setContent(data.content);
      }
    } catch (error) {
      console.log("error", error);
      toast.error(error.message);
    }
    setLoading(false);
  };
  console.log(content);
  return (
    <div className="h-full overflow-y-scroll p-6  items-start  gap-4 text-slate-700">
      {/* left col */}
      <form
        className="w-full  p-4 text-white rounded-lg "
        onSubmit={handleSubmit}
      >
        <div className="flex items-center gap-3">
          {/* <Sparkles className="w-6 text-[#8E37EB]" /> */}
          <h1 className="text-3xl font-semibold">Blog Title Generator</h1>
        </div>
        <p className="mt-6 text-sm text-[#BA9E9E] font-medium">Keyword</p>
        <input
          onChange={(e) => setInput(e.target.value)}
          value={input}
          type="text"
          className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300"
          placeholder="The future of artificial intelligence is..."
          required
        />
        <p className="mt-4 text-sm text-[#BA9E9E] font-medium">Category</p>
        <div className="mt-3 flex gap-3 flex-wrap sm:max-w-9/11">
          {blogCategories.map((item) => (
            <span
              onClick={() => setSelectedCategory(item)}
              className={`text-md px-4 py-1 border rounded-md  cursor-pointer ${
                selectedCategory === item
                  ? "bg-[#BA9E9E] text-white"
                  : ""
              }`}
            >
              {item}
            </span>
          ))}
        </div>
        <br />
        <div className="flex justify-end">
               <button
                 disabled={loading}
                 className="flex items-center gap-2 bg-[#ED1212] text-white px-5 py-2 mt-6 text-sm rounded-lg cursor-pointer hover:bg-[#c70f0f] transition"
               >
                 {!loading ? <Edit className="w-5" /> : <p>...</p>}
                 {!loading ? "Generate Article" : "Generating..."}
               </button>
             </div>
      </form>
      {/* roght col  */}
      <div className="w-full p-4 text-white rounded-lg flex flex-col ">
        <div className="flex items-center gap-3">
          {/* <Hash className="w-5 h-5 text-[#4A7AFF]" /> */}
          <h1 className="text-3xl font-semibold">Generated Titles</h1>
        </div>

        {!content ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="text-sm flex flex-col items-center gap-5 text-[#BA9E9E]">
              <Hash className="w-9 h-9" />
              <p>Enter a topic and click "Generate title" to get started</p>
            </div>
          </div>
        ) : (
          <div className="mt-3 h-full overflow-y-scroll text-sm text-slate-600">
          <Markdown>
            {content}
            </Markdown>  
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogTitles;
