import { FileText, Sparkles } from 'lucide-react';
import React, { useState } from 'react';
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const ReviewResume = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const { getToken } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      toast.error("Please upload a resume first");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("resume", file);

      const { data } = await axios.post(
        "/api/ai/resume-review",
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
        toast.success("Resume analyzed successfully!");
      } else {
        toast.error(data.message || "Failed to analyze resume");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (selectedFile) setPreview(URL.createObjectURL(selectedFile));
  };

  return (
    <div className="h-full overflow-y-scroll p-6 flex flex-wrap gap-4 text-slate-700">
      {/* Left column */}
      <form
        className="w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200"
        onSubmit={handleSubmit}
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 text-[#00da83]" />
          <h1 className="text-xl font-semibold">Review Resume</h1>
        </div>

        <p className="mt-6 text-sm font-medium">Upload Your Resume</p>
        <input
          onChange={handleFileChange}
          accept="application/pdf"
          type="file"
          className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300"
          required
        />
        <p className="text-gray-500 text-sm font-medium">Supports PDF resume only</p>

        <button
          type="submit"
          className="w-full flex justify-center items-center gap-2
          bg-gradient-to-r from-[#44a58a] to-[#00da83] text-white px-4 py-2 mt-6
          text-sm rounded-lg cursor-pointer"
          disabled={loading}
        >
          <FileText className="w-5" />
          {loading ? "Analyzing..." : "Review Resume"}
        </button>
      </form>

      {/* Right column */}
      <div className="w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-[24rem] max-h-[600px]">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-[#00da83]" />
          <h1 className="text-xl font-semibold">Analysis Results</h1>
        </div>

        <div className="flex-1 overflow-y-auto mt-4">
          {content ? (
            <div className="text-sm text-gray-700 whitespace-pre-line">{content}</div>
          ) : (
            <div className="text-sm flex flex-col items-center gap-5 text-gray-400">
              <FileText className="w-9 h-9" />
              <p>Upload your resume and get an analysis</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewResume;
