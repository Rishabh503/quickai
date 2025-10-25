import { Image, Sparkles, Loader2, Download } from "lucide-react";
import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "@clerk/clerk-react";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const GenerateImages = () => {
  const Styles = ["Realistic", "Cartoon", "Abstract", "Oil Painting", "Watercolor"];
  const [selectedStyle, setSelectedStyle] = useState("Realistic");
  const [input, setInput] = useState("");
  const [publish, setPublish] = useState(true);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const { getToken } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setContent("");
      const prompt = `Give me a great ${input} image in the ${selectedStyle} style.`;
      const { data } = await axios.post(
        "/api/ai/generate-image",
        {
          prompt,
          publish,
        },
        {
          headers: { Authorization: `Bearer ${await getToken()}` },
        }
      );

      if (data.success) {
        setContent(data.content);
        toast.success("Image generated successfully!");
      } else {
        toast.error(data.message || "Something went wrong");
      }
    } catch (error) {
      console.log("error", error);
      toast.error("Error generating image");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen  text-white p-8">
      <div className=" mx-auto">
        <h1 className="text-3xl font-bold mb-8">Image Generation</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Textarea */}
          <div>
            <textarea
              onChange={(e) => setInput(e.target.value)}
              value={input}
              className="w-full bg-[#2a2424] text-gray-300 placeholder-gray-500 rounded-lg p-4 outline-none border border-[#3a3434] focus:border-[#4a4444] transition"
              placeholder="Describe the image you want to generate"
              required
              rows={2}
            />
          </div>

          {/* Style Section */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Style</h2>
            <div className="flex flex-wrap gap-3">
              {Styles.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setSelectedStyle(item)}
                  className={`px-6 py-2 rounded-full border transition ${
                    selectedStyle === item
                      ? "bg-white text-black border-white"
                      : "bg-transparent text-gray-400 border-gray-600 hover:border-gray-400"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Visibility Section */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Visibility</h2>
            <div className="flex justify-between gap-3">
             <div className="flex gap-4">
               <button
                type="button"
                onClick={() => setPublish(true)}
                className={`px-6 py-2 rounded-full border transition ${
                  publish
                    ? "bg-white text-black border-white"
                    : "bg-transparent text-gray-400 border-gray-600 hover:border-gray-400"
                }`}
              >
                Public
              </button>
              <button
                type="button"
                onClick={() => setPublish(false)}
                className={`px-6 py-2 rounded-full border transition ${
                  !publish
                    ? "bg-white text-black border-white"
                    : "bg-transparent text-gray-400 border-gray-600 hover:border-gray-400"
                }`}
              >
                Private
              </button>
             </div>
               <div>
                <button
              type="submit"
              disabled={loading}
              className="bg-[#ff3333] hover:bg-[#ff4444] text-white px-8 py-3 rounded-lg font-medium transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Image"
              )}
            </button>
               </div>
            </div>
            
          </div>

    
        </form>

        {/* Generated Image Display */}
        {content && (
          <div className="mt-12">
            <div className="bg-[#1a1a1a] rounded-lg p-6 border border-[#2a2a2a]">
              <img
                src={content}
                alt="Generated"
                className="w-full rounded-lg"
              />
              <div className="mt-4 flex justify-center">
                <a
                  href={content}
                  download="generated-image.png"
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition"
                >
                  <Download className="w-4 h-4" />
                  Download Image
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!content && !loading && (
          <div className="mt-12 bg-[#1a1a1a] rounded-lg p-12 border border-[#2a2a2a] flex flex-col items-center justify-center text-gray-500">
            <Image className="w-16 h-16 mb-4" />
            <p>Your generated image will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerateImages;