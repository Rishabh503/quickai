import { FileText, Sparkles, Loader2, Upload, X, Download } from 'lucide-react';
import React, { useState, useRef } from 'react';
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import Markdown from "react-markdown"
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const ReviewResume = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

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
    if (selectedFile) {
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile);
        setPreview(selectedFile.name);
        setContent(""); // Clear previous results
      } else {
        toast.error("Please upload a PDF file");
      }
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
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile);
        setPreview(droppedFile.name);
        setContent("");
      } else {
        toast.error("Please upload a PDF file");
      }
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview("");
    setContent("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="h-full overflow-y-auto  text-white p-8">
      <div className=" mx-auto">
        <h1 className="text-3xl font-bold mb-8">Resume Review</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Upload Section */}
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
              <div className="flex items-center justify-between bg-[#2a2424] p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-gray-400" />
                  <div>
                    <p className="font-medium">{preview}</p>
                    <p className="text-sm text-gray-400">PDF Document</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={clearFile}
                  className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center">
                <Upload className="w-12 h-12 text-gray-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Upload your resume</h3>
                <p className="text-gray-400 mb-6">
                  Drag and drop or browse to upload your resume for review.
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-[#3a3434] hover:bg-[#4a4444] text-white px-6 py-3 rounded-lg transition"
                >
                  Upload Resume
                </button>
                <input
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="application/pdf"
                  type="file"
                  className="hidden"
                />
                <p className="text-sm text-gray-500 mt-4">Supports PDF format only</p>
              </div>
            )}
          </div>

          {/* Review Button */}
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
                    Analyzing...
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5" />
                    Review Resume
                  </>
                )}
              </button>
            </div>
          )}
        </form>

        {/* Analysis Results Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Analysis Results</h2>
          <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a]">
            {loading ? (
              <div className="flex flex-col items-center justify-center text-gray-400 py-20">
                <Loader2 className="w-12 h-12 animate-spin mb-4" />
                <p className="text-lg">Analyzing your resume...</p>
              </div>
            ) : content ? (
              <div className="p-6">
                <div className="prose prose-invert max-w-none">
                  <div className="text-gray-300 whitespace-pre-line leading-relaxed">
                   <Markdown>
                    {content}
                    </Markdown> 
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-500 py-20">
                <FileText className="w-16 h-16 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No analysis yet</h3>
                <p className="text-center max-w-md">
                  Upload your resume and click "Review Resume" to get detailed feedback
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewResume;