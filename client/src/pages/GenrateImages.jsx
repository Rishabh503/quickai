import { Image, Sparkles, Loader2, Download } from "lucide-react";
import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "@clerk/clerk-react";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const GenerateImages = () => {
  const Styles = ["Realistic", "Ghibli Style"];
  const [selectedStyle, setSelectedStyle] = useState("Realistic");
  const [input, setInput] = useState("");
  const [publish, setPublish] = useState(false);
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
    <div className="h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700">
      {/* Left column */}
      <form
        className="w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200"
        onSubmit={handleSubmit}
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 text-[#00AD25]" />
          <h1 className="text-xl font-semibold">AI Image Generator</h1>
        </div>

        <p className="mt-6 text-sm font-medium">Describe Your Image</p>
        <textarea
          onChange={(e) => setInput(e.target.value)}
          value={input}
          className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300"
          placeholder="The future of artificial intelligence is..."
          required
          rows={8}
        />

        <p className="mt-4 text-sm font-medium">Style</p>
        <div className="mt-3 flex gap-3 flex-wrap">
          {Styles.map((item) => (
            <span
              key={item}
              onClick={() => setSelectedStyle(item)}
              className={`text-xs px-4 py-1 border rounded-full cursor-pointer ${
                selectedStyle === item
                  ? "bg-green-50 text-green-700 border-green-400"
                  : "bg-gray-50 border-gray-300"
              }`}
            >
              {item}
            </span>
          ))}
        </div>

        <div className="my-6 flex items-center gap-2">
          <label className="relative cursor-pointer">
            <input
              type="checkbox"
              onChange={(e) => setPublish(e.target.checked)}
              checked={publish}
              className="sr-only peer"
            />
            <div
              className="w-9 h-5 bg-slate-300 rounded-full
        peer-checked:bg-green-500 transition"
            ></div>
            <span
              className="absolute left-1 top-1 w-3 h-3 bg-white
        rounded-full transition peer-checked:translate-x-4"
            ></span>
          </label>
          <p>Make this image Public</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center items-center gap-2
  bg-gradient-to-r from-[#aac9a6] to-[#00AD25] text-white px-4 py-2 mt-6
  text-sm rounded-lg cursor-pointer disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Image className="w-5" />
              Generate Image
            </>
          )}
        </button>
      </form>

      {/* Right column */}
      <div className="w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96 max-h-[600px]">
        <div className="flex items-center gap-3 mb-3">
          <Image className="w-5 h-5 text-[#00AD25]" />
          <h1 className="text-xl font-semibold">Generated Image</h1>
        </div>

        <div className="flex-1 flex justify-center items-center">
          {!content ? (
            <div className="text-sm flex flex-col items-center gap-5 text-gray-400">
              <Image className="w-9 h-9" />
              <p>Describe an image and click “Generate Image” to get started</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <img
                src={content}
                alt="Generated"
                className="rounded-lg shadow-md max-h-[400px] object-contain"
              />
              <a
                href={content}
                download="generated-image.png"
                className="flex items-center gap-2 text-sm text-green-600 hover:underline"
              >
                <Download className="w-4 h-4" />
                Download Image
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerateImages;
