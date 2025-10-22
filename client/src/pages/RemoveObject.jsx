import { Image, Scissors, Sparkles } from "lucide-react";
import React, { useState } from "react";
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
    setInput(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  return (
    <div className="h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700">
      {/* Left column (upload + form) */}
      <form
        className="w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200"
        onSubmit={handleSubmit}
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 text-[#4a7aff]" />
          <h1 className="text-xl font-semibold">Object Removal</h1>
        </div>

        <p className="mt-6 text-sm font-medium">Upload Image</p>
        <input
          onChange={handleFileChange}
          accept="image/*"
          type="file"
          className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300"
          required
        />

        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="mt-4 rounded-md max-h-64 object-contain border"
          />
        )}

        <p className="mt-6 text-sm font-medium">Describe Object to Remove</p>
        <textarea
          onChange={(e) => setObject(e.target.value)}
          value={object}
          className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300"
          placeholder="eg. remove car in background..."
          required
          rows={4}
        />
        <p className="text-small text-gray-500">
          Be specific about what you want to remove.
        </p>

        <button
          disabled={loading}
          className={`w-full flex justify-center items-center gap-2
          bg-gradient-to-r from-[#494679] to-[#4a7aff] text-white px-4 py-2 mt-6
          text-sm rounded-lg cursor-pointer ${loading && "opacity-70"}`}
        >
          <Scissors className="w-5" />
          {loading ? "Processing..." : "Remove Object"}
        </button>
      </form>

      {/* Right column (processed image) */}
      <div className="w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96 max-h-[600px]">
        <div className="flex items-center gap-3">
          <Scissors className="w-5 h-5 text-[#4a7aff]" />
          <h1 className="text-xl font-semibold">Processed Image</h1>
        </div>

        <div className="flex-1 flex justify-center items-center">
          {content ? (
            <img
              src={content}
              alt="Processed"
              className="max-h-[450px] rounded-md object-contain"
            />
          ) : (
            <div className="text-sm flex flex-col items-center gap-5 text-gray-400">
              <Scissors className="w-9 h-9" />
              <p>Upload an image and describe what to remove</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RemoveObject;
