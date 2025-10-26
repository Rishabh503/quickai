import Markdown from "react-markdown";
import { Download, Copy } from "lucide-react";

export const ModalCreation = ({ creation, onClose }) => {
  if (!creation) return null;

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = creation.content;
    link.download = creation.title || "download";
    link.click();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(creation.content || "");
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div
        className={`bg-[#1a1a1a] rounded-xl w-full overflow-hidden shadow-2xl relative border border-[#2a2a2a] 
        ${creation.type === "image" ? "max-w-2xl" : "max-w-5xl"} 
        transition-all duration-300`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white transition"
        >
          ✕
        </button>

        {/* IMAGE TYPE VIEW */}
        {creation.type === "image" && (
          <div className="flex flex-col">
            {/* Image on top */}
            <div className="w-full h-80 overflow-hidden">
              <img
                src={creation.content}
                alt={creation.title || creation.prompt}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Details below */}
            <div className="p-5 flex flex-col gap-3">
              <h2 className="text-2xl font-bold">
                {creation.title || creation.prompt || "AI Image Creation"}
              </h2>

              {creation.author && (
                <p className="text-gray-400 text-sm">By {creation.author}</p>
              )}

              <p className="text-gray-300 text-sm leading-relaxed">
                {creation.description ||
                  "No additional details available for this creation."}
              </p>

              {/* Download button */}
              <button
                onClick={handleDownload}
                className="mt-4 flex items-center gap-2 bg-[#ED1212] transition text-white px-4 py-2 rounded-lg self-start"
              >
                <Download size={18} /> Download Image
              </button>
            </div>
          </div>
        )}

        {/* ARTICLE TYPE VIEW */}
        {creation.type !== "image" && (
          <div className="p-6 flex flex-col gap-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-1">
                  {creation.title || creation.prompt || "AI Article"}
                </h2>
                {creation.author && (
                  <p className="text-gray-400 text-sm">By {creation.author}</p>
                )}
              </div>

              {/* Copy button */}
              <button
                onClick={handleCopy}
                className="mt-2 sm:mt-0 flex items-center gap-2 bg-[#ED1212] transition text-white px-4 py-2 rounded-lg"
              >
                <Copy size={18} /> Copy Content
              </button>
            </div>

            {/* Article Markdown Content */}
            <div className="prose prose-invert max-w-none text-gray-200 leading-relaxed">
              <Markdown>
                {creation.content ||
                  "No additional details available for this article."}
              </Markdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
