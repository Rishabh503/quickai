import { EraserIcon, Sparkles, Loader2, Upload, X } from "lucide-react";
import React, { useState, useRef } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const RemoveBackground = () => {
  const [input, setInput] = useState("");
  const [preview, setPreview] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

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
    if (file) {
      setInput(file);
      setPreview(URL.createObjectURL(file));
      setContent(""); // Clear previous result
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        setInput(file);
        setPreview(URL.createObjectURL(file));
        setContent("");
      } else {
        toast.error("Please upload an image file");
      }
    }
  };

  const clearImage = () => {
    setInput("");
    setPreview("");
    setContent("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="h-full overflow-y-auto  text-white p-8">
      <div className=" mx-auto">
        <h1 className="text-3xl font-bold mb-8">Image Background Remover</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Drag and Drop Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-12 transition-colors ${
              dragActive
                ? "border-gray-400 bg-[#1a1a1a]"
                : "border-gray-700 bg-[#0a0a0a]"
            }`}
          >
            {preview ? (
              <div className="relative">
                <img
                  src={preview}
                  alt="preview"
                  className="w-full max-h-96 object-contain rounded-lg"
                />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center">
                <Upload className="w-12 h-12 text-gray-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  Drag and drop an image here
                </h3>
                <p className="text-gray-400 mb-6">
                  Or click to select a file from your computer
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-[#3a3434] hover:bg-[#4a4444] text-white px-6 py-3 rounded-lg transition"
                >
                  Select Image
                </button>
                <input
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  type="file"
                  className="hidden"
                />
              </div>
            )}
          </div>

          {/* Remove Background Button */}
          {preview && (
            <div className="flex justify-end">
              <button
                disabled={loading}
                type="submit"
                className="bg-[#ff3333] hover:bg-[#ff4444] text-white px-8 py-3 rounded-lg font-medium transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <EraserIcon className="w-5 h-5" />
                    Remove Background
                  </>
                )}
              </button>
            </div>
          )}
        </form>

        {/* Final Image Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Final Image</h2>
          <div className="border-2 border-dashed border-gray-700 rounded-lg p-12 bg-[#0a0a0a]">
            {loading ? (
              <div className="flex flex-col items-center justify-center text-gray-400 py-20">
                <Loader2 className="w-12 h-12 animate-spin mb-4" />
                <p className="text-lg">Processing your image...</p>
              </div>
            ) : content ? (
              <div className="flex flex-col items-center">
                <img
                  src={content}
                  alt="processed"
                  className="w-full max-h-[500px] object-contain rounded-lg"
                />
                <a
                  href={content}
                  download="background-removed.png"
                  className="mt-6 bg-[#3a3434] hover:bg-[#4a4444] text-white px-6 py-3 rounded-lg transition inline-block"
                >
                  Download Image
                </a>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-500 py-20">
                <EraserIcon className="w-16 h-16 mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  Your final image will appear here
                </h3>
                <p className="text-center max-w-md">
                  Once you've uploaded an image, the background-removed version
                  will be displayed here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RemoveBackground;