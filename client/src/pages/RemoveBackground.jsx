import { EraserIcon, Sparkles, Loader2 } from "lucide-react";
import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const RemoveBackground = () => {
  const [input, setInput] = useState("");
  const [preview, setPreview] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const { getToken } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input) {
      toast.error("Please upload an image first");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("image", input);

      const { data } = await axios.post(
        "/api/ai/remove-image-background",
        formData,
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (data.success) {
        setContent(data.content);
        toast.success("Background removed successfully!");
      } else {
        toast.error(data.message || "Failed to process image");
      }
    } catch (error) {
      console.log("error", error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setInput(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  return (
    <div className="h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700">
      {/* Left column */}
      <form
        className="w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200"
        onSubmit={handleSubmit}
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 text-[#FF4938]" />
          <h1 className="text-xl font-semibold">Background Removal</h1>
        </div>

        <p className="mt-6 text-sm font-medium">Upload Your Image</p>
        <input
          onChange={handleFileChange}
          accept="image/*"
          type="file"
          className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300"
          required
        />
        <p className="text-gray-500 text-sm font-medium mt-1">
          Supports JPG, PNG, and other image formats
        </p>

        {preview && (
          <div className="mt-4 flex justify-center">
            <img
              src={preview}
              alt="preview"
              className="rounded-lg border border-gray-300 w-full max-h-64 object-contain"
            />
          </div>
        )}

        <button
          disabled={loading}
          type="submit"
          className={`w-full flex justify-center items-center gap-2
            bg-gradient-to-r from-[#f6ab41] to-[#FF4938] text-white px-4 py-2 mt-6
            text-sm rounded-lg cursor-pointer disabled:opacity-60`}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <EraserIcon className="w-5" />
              Remove Background
            </>
          )}
        </button>
      </form>

      {/* Right column */}
      <div className="w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96 max-h-[600px]">
        <div className="flex items-center gap-3">
          <EraserIcon className="w-5 h-5 text-[#FF4938]" />
          <h1 className="text-xl font-semibold">Processed Image</h1>
        </div>

        <div className="flex-1 flex justify-center items-center mt-4">
          {loading ? (
            <div className="flex flex-col items-center text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="mt-2 text-sm">Processing your image...</p>
            </div>
          ) : content ? (
            <img
              src={content}
              alt="processed"
              className="rounded-lg w-full max-h-[450px] object-contain border border-gray-200"
            />
          ) : (
            <div className="text-sm flex flex-col items-center gap-3 text-gray-400">
              <EraserIcon className="w-9 h-9" />
              <p>Upload an image and click "Remove Background" to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RemoveBackground;
