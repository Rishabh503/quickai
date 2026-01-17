import { Image, Scissors, Sparkles, Loader2, Upload, X } from "lucide-react";
import React, { useState, useRef } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const RemoveObject = () => {
  const [input, setInput] = useState("");
  const [object, setObject] = useState("");
  const [preview, setPreview] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const { getToken } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!input) {
      toast.error("Please upload an image first");
      return;
    }

    if (!object) {
      toast.error("Please describe what to remove");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("image", input);
      formData.append("object", object);

      const { data } = await axios.post(
        "/api/ai/remove-image-object",
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
        toast.success("Object removed successfully!");
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

  const clearImage = () => {
    setInput("");
    setPreview("");
    setContent("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDownload = async () => {
  const response = await fetch(content);
  const blob = await response.blob();

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "object-removed.png";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};


  return (
    <div className="h-full overflow-y-auto  text-white p-8">
      <div className=" mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Object Remover</h1>
          <p className="text-gray-400">Remove unwanted objects from your images</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Select Image Section */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Select Image</h2>
            <div className="bg-[#2a2424] rounded-lg p-6">
              {preview ? (
                <div className="relative">
                  <img
                    src={preview}
                    alt="preview"
                    className="w-full max-h-80 object-contain rounded-lg"
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
                <div className="flex flex-col items-center justify-center py-12">
                  <Upload className="w-12 h-12 text-gray-500 mb-4" />
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
                    required
                  />
                </div>
              )}
            </div>
          </div>

          {/* Describe Object Section */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Describe the object(s) to remove</h2>
            <textarea
              onChange={(e) => setObject(e.target.value)}
              value={object}
              className="w-full bg-[#2a2424] text-gray-300 placeholder-gray-500 rounded-lg p-4 outline-none border border-[#3a3434] focus:border-[#4a4444] transition resize-none"
              placeholder="e.g., Remove the car from the background"
              required
              rows={3}
            />
          </div>

          {/* Remove Object Button */}
          <div className="flex justify-end">
            <button
              disabled={loading || !preview}
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
                  <Scissors className="w-5 h-5" />
                  Remove Object
                </>
              )}
            </button>
          </div>
        </form>

        {/* Final Image Area */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Final Image Area</h2>
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
               <button
  onClick={handleDownload}
  className="mt-6 bg-[#3a3434] hover:bg-[#4a4444] text-white px-6 py-3 rounded-lg transition"
>
  Download Image
</button>

              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-500 py-20">
                <Scissors className="w-16 h-16 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No image selected</h3>
                <p className="text-center max-w-md">
                  Please select an image to remove objects
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RemoveObject;