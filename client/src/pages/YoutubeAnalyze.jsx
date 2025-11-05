import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { Youtube, Brain, LoaderCircle, Clock } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";
import Markdown from "react-markdown";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const YouTubeAnalyzer = () => {
  const { getToken } = useAuth();
  const [videoUrl, setVideoUrl] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("summary");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!videoUrl.trim()) {
      toast.error("Please enter a YouTube video link");
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.post(
        "/api/ai/youtube-analyze",
        { videoUrl },
        {
          headers: { Authorization: `Bearer ${await getToken()}` },
        }
      );

      console.log("data:", data);
      if (data.success) {
        setAnalysis(data);
        toast.success("Analysis complete!");
      } else {
        toast.error(data.message || "Something went wrong");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to analyze video");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "summary", label: "Summary" },
    { id: "properExplanation", label: "Explanation" },
    { id: "detailedNotes", label: "Notes" },
    { id: "actionItems", label: "Action Items" },
    { id: "studyTopics", label: "Study Topics" },
  ];

  return (
    <div className="h-full overflow-y-scroll p-6 items-start gap-4 text-slate-700">
      {/* Input Section */}
      <form
        onSubmit={handleSubmit}
        className="w-full p-4 text-white rounded-lg"
      >
        <div className="flex items-center gap-3">
     
          <h1 className="text-2xl font-semibold">YouTube Video Analyzer</h1>
        </div>

        <p className="mt-6 text-sm text-[#BA9E9E] font-medium">
          Paste YouTube Video Link
        </p>
        <input
          type="url"
          required
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300"
        />

        <div className="flex justify-end">
          <button
            disabled={loading}
            className="flex items-center gap-2 bg-[#ED1212] text-white px-5 py-2 mt-6 text-sm rounded-lg cursor-pointer hover:bg-[#c70f0f] transition"
          >
            {!loading ? (
       ""
            ) : (
              <LoaderCircle className="w-5 animate-spin" />
            )}
            {!loading ? "Analyze Video" : "Analyzing..."}
          </button>
        </div>
      </form>

      {/* Results Section */}
      <div className="w-full p-4 text-white rounded-lg flex flex-col">
        <div className="flex items-center gap-3 mb-4">
       
          <h1 className="text-3xl font-semibold">Analysis Result</h1>
        </div>

        {!analysis ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="text-sm flex flex-col items-center gap-5 text-[#BA9E9E]">
              <Brain className="w-9 h-9" />
              <p>Paste a video link and click “Analyze Video” to get started</p>
            </div>
          </div>
        ) : (
          <div className="mt-4">
            {/* Video Info */}
            <div className="flex items-center gap-3 bg-slate-100 p-3 rounded-lg mb-4">
              <img
                src={analysis.videoInfo.thumbnail}
                alt="thumb"
                className="w-28 h-20 rounded-md object-cover"
              />
              <div>
                <h2 className="text-lg font-semibold text-black">
                  {analysis.videoInfo.title}
                </h2>
                <p className="text-gray-500 text-sm">
                  {analysis.videoInfo.channel}
                </p>
              </div>
            </div>

            {/* Slide Tabs */}
            <div className="flex gap-3 mb-4 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    activeTab === tab.id
                      ? "bg-[#ED1212] text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Display Content Based on Selected Tab */}
            <div className="bg-white p-4 rounded-lg text-gray-700 shadow-sm">
              {activeTab === "summary" && (
                <p className="leading-relaxed">{analysis.summary}</p>
              )}

              {activeTab === "properExplanation" && (
                <p className="leading-relaxed">
                  {analysis.properExplanation || "No explanation found."}
                </p>
              )}

              {activeTab === "detailedNotes" && (
                <div>
                  <h3 className="text-lg font-semibold text-[#ED1212] mb-2">
                    Detailed Notes
                  </h3>
                  <p className="text-gray-700 mb-2">
                    {analysis.detailedNotes?.introduction}
                  </p>

                  {analysis.detailedNotes?.mainConcepts?.map((item, i) => (
                    <div key={i} className="mt-3">
                      <p className="font-semibold text-black">{item.topic}</p>
                      <p className="text-gray-700">{item.content}</p>
                    </div>
                  ))}

                  {analysis.detailedNotes?.practicalApplications?.length > 0 && (
                    <div className="mt-3">
                      <p className="font-semibold text-black">
                        Practical Applications:
                      </p>
                      <ul className="list-disc list-inside text-sm text-gray-700">
                        {analysis.detailedNotes.practicalApplications.map(
                          (app, i) => (
                            <li key={i}>{app}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                  <p className="mt-3 text-gray-700">
                    <strong>Conclusion:</strong>{" "}
                    {analysis.detailedNotes?.conclusion}
                  </p>
                </div>
              )}

              {activeTab === "actionItems" && (
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {analysis.actionItems?.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              )}

              {activeTab === "studyTopics" && (
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {analysis.studyTopics?.map((topic, i) => (
                    <li key={i}>{topic}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default YouTubeAnalyzer;
