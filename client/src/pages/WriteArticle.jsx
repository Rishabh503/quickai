import { Edit, Sparkles } from "lucide-react";
import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import Markdown from "react-markdown";
import toast from "react-hot-toast";
axios.defaults.baseUrl = import.meta.env.VITE_BASE_URL;

const WriteArticle = () => {
  console.log(import.meta.env.VITE_BASE_URL);
  const articleLength = [
    { length: 800, text: "Short (500-800 words)" },
    { length: 1200, text: "Medium (800-1200 words)" },
    { length: 1600, text: "Long (1200-1600 words)" },
  ];

  const [selectedLength, setSelectedLength] = useState(articleLength[0]);
  const [input, setInput] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const { getToken } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const prompt = `write an article about ${input} in ${selectedLength.text}`;
      const { data } = await axios.post(
        "/api/ai/generate-article",
        {
          prompt,
          length: selectedLength.text,
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
    <div className="h-full overflow-y-scroll p-6 items-start text-slate-700 space-y-8">
      {/* left col */}
      <form
        className="w-full text-white shadow-sm  p-5 rounded-xl"
        onSubmit={handleSubmit}
      >
        <div className="flex items-center gap-3 mb-4">
          {/* <Sparkles className="w-6 text-[#4A7AFF]" /> */}
          <h1 className="text-2xl font-semibold text-white">
            Article Generator
          </h1>
        </div>

        <p className="mt-4 text-sm font-medium ">Article Topic</p>
        <input
          onChange={(e) => setInput(e.target.value)}
          value={input}
          type="text"
          className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300"
          placeholder="The future of artificial intelligence is..."
          required
        />

        <p className="mt-4 text-sm font-medium ">
          Article Length
        </p>
        <div className="mt-3 flex gap-3 flex-wrap sm:max-w-9/11">
          {articleLength.map((item, index) => (
            <span
              onClick={() => setSelectedLength(item)}
              className={`text-md px-4 py-1 border rounded-full cursor-pointer transition ${
                selectedLength.text === item.text
                  ? "bg-[#BA9E9E] text-white border-transparent"
                  : "border-gray-300 hover:bg-gray-100"
              }`}
              key={index}
            >
              {item.text}
            </span>
          ))}
        </div>

        {/* right-aligned button */}
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

      {/* right col */}
      <div className="w-full  shadow-xs text-white p-5 rounded-xl ">
        <div className="flex items-center gap-3 mb-4">
          <Edit className="w-5 h-5 text-[#ED1212]" />
          <h1 className="text-2xl font-">
            Generated Article
          </h1>
        </div>

        {!content ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="text-md flex flex-col items-center gap-5 ">
              <Edit className="w-9 h-9 text-[#ED1212]  " />
              <p>Enter a topic and click "Generate Article" to get started</p>
            </div>
          </div>
        ) : (
          <div className="mt-3 text-sm  leading-relaxed whitespace-pre-line">
           <Markdown>
            {content}
           </Markdown>
          </div>
        )}
      </div>
    </div>
  );
};

export default WriteArticle;
