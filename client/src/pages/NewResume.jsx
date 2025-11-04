import { FileText, Sparkles, Loader2, Upload, X, Download, Edit, Save, History, Eye } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import Markdown from "react-markdown";
import toast from "react-hot-toast";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { DiffMatchPatch } from 'diff-match-patch';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const ReviewResume = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [editorMode, setEditorMode] = useState(false);
  const [editorContent, setEditorContent] = useState("");
  const [originalContent, setOriginalContent] = useState("");
  const [reviewHistory, setReviewHistory] = useState([]);
  const [currentVersion, setCurrentVersion] = useState(1);
  const [showHistory, setShowHistory] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  
  const fileInputRef = useRef(null);
  const { getToken } = useAuth();

  // Tiptap editor configuration
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: editorContent,
    onUpdate: ({ editor }) => {
      setEditorContent(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[500px] p-4',
      },
    },
  });

  // Update editor content when editorContent state changes
  useEffect(() => {
    if (editor && editorContent && editor.getHTML() !== editorContent) {
      editor.commands.setContent(editorContent);
    }
  }, [editorContent, editor]);

  // Rich text editor configuration (kept for reference, not used)
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      ['link'],
      [{ 'align': [] }],
      ['clean']
    ],
  };

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent', 'link', 'align'
  ];

  // Load resume versions and history
  useEffect(() => {
    if (content) {
      loadReviewHistory();
    }
  }, [content]);

  const loadReviewHistory = async () => {
    try {
      const { data } = await axios.get('/api/ai/resume-history', {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });
      
      if (data.success) {
        setReviewHistory(data.history || []);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file && !editorContent) {
      toast.error("Please upload a resume first");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      
      if (editorMode && editorContent) {
        // Send HTML content from editor
        formData.append("htmlContent", editorContent);
        formData.append("version", currentVersion);
        formData.append("previousReview", content || "");
      } else {
        formData.append("resume", file);
      }

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
        setCurrentVersion(data.version || currentVersion);
        
        // Add to history
        setReviewHistory(prev => [...prev, {
          version: data.version || currentVersion,
          review: data.content,
          timestamp: new Date().toISOString(),
          changes: data.changes || []
        }]);
        
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

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile);
        setPreview(selectedFile.name);
        setContent("");
        
        // Extract text for editor
        const loadingToast = toast.loading("Extracting text from PDF...");
        try {
          const formData = new FormData();
          formData.append("file", selectedFile);
          
          const { data } = await axios.post('/api/ai/extract-resume-text', formData, {
            headers: {
              Authorization: `Bearer ${await getToken()}`,
              "Content-Type": "multipart/form-data",
            },
            timeout: 30000, // 30 second timeout
          });
          
          toast.dismiss(loadingToast);
          
          if (data.success && data.htmlContent) {
            setOriginalContent(data.htmlContent);
            setEditorContent(data.htmlContent);
            toast.success(`Text extracted! (${data.textLength || 0} characters)`);
          } else {
            console.error('Extraction failed:', data.message);
            toast.warning("Text extraction limited. You can still edit manually.");
            setEditorContent("<h2>Your Name</h2><p>Email | Phone | Location</p><h3>PROFESSIONAL SUMMARY</h3><p>Add your professional summary here...</p><h3>EXPERIENCE</h3><p>Company Name | Job Title | Dates</p><p>• Achievement 1</p><p>• Achievement 2</p><h3>EDUCATION</h3><p>Degree | University | Year</p><h3>SKILLS</h3><p>List your skills here</p>");
            setOriginalContent(editorContent);
          }
        } catch (error) {
          toast.dismiss(loadingToast);
          console.error('Failed to extract text:', error.response?.data || error.message);
          toast.error(`Extraction failed: ${error.response?.data?.message || error.message}`);
          
          // Provide template so user can still use editor
          const template = "<h2>Your Name</h2><p>Email | Phone | Location</p><h3>PROFESSIONAL SUMMARY</h3><p>Add your professional summary here...</p><h3>EXPERIENCE</h3><p>Company Name | Job Title | Dates</p><p>• Achievement 1</p><p>• Achievement 2</p><h3>EDUCATION</h3><p>Degree | University | Year</p><h3>SKILLS</h3><p>List your skills here</p>";
          setEditorContent(template);
          setOriginalContent(template);
        }
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
        handleFileChange({ target: { files: [droppedFile] } });
      } else {
        toast.error("Please upload a PDF file");
      }
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview("");
    setContent("");
    setEditorContent("");
    setOriginalContent("");
    setEditorMode(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const toggleEditorMode = () => {
    console.log('Toggle editor - file:', file);
    console.log('Toggle editor - editorContent:', editorContent);
    console.log('Toggle editor - preview:', preview);
    
    if (!file && !preview) {
      toast.error("Please upload a resume first");
      return;
    }
    
    if (!editorContent || editorContent.trim() === '') {
      // If no content extracted, provide a template
      const template = `<h2>YOUR NAME</h2>
<p>Email: your.email@example.com | Phone: (123) 456-7890 | Location: City, State</p>

<h3>PROFESSIONAL SUMMARY</h3>
<p>Add your professional summary here. Highlight your key strengths and career objectives.</p>

<h3>EXPERIENCE</h3>
<p><strong>Job Title | Company Name</strong></p>
<p><em>Start Date - End Date</em></p>
<p>• Achievement or responsibility 1</p>
<p>• Achievement or responsibility 2</p>
<p>• Achievement or responsibility 3</p>

<h3>EDUCATION</h3>
<p><strong>Degree | University Name</strong></p>
<p><em>Graduation Year</em></p>

<h3>SKILLS</h3>
<p>Skill 1, Skill 2, Skill 3, Skill 4, Skill 5</p>

<h3>PROJECTS</h3>
<p><strong>Project Name</strong></p>
<p>Brief description of the project and your role.</p>`;
      
      setEditorContent(template);
      setOriginalContent(template);
      toast.info("Template loaded. Edit your resume below.");
    }
    
    setEditorMode(!editorMode);
  };

  const saveEditorContent = async () => {
    try {
      const { data } = await axios.post('/api/ai/save-resume-version', {
        content: editorContent,
        version: currentVersion + 1,
      }, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });

      if (data.success) {
        setCurrentVersion(prev => prev + 1);
        setOriginalContent(editorContent);
        toast.success("Resume version saved!");
      }
    } catch (error) {
      toast.error("Failed to save resume");
    }
  };

  const exportToPDF = async () => {
    try {
      const { data } = await axios.post('/api/ai/export-resume-pdf', {
        htmlContent: editorContent,
      }, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `resume_v${currentVersion}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success("Resume exported!");
    } catch (error) {
      toast.error("Failed to export resume");
    }
  };

  const getDiffHTML = () => {
    const dmp = new DiffMatchPatch();
    const diff = dmp.diff_main(originalContent, editorContent);
    dmp.diff_cleanupSemantic(diff);
    
    let html = '';
    diff.forEach(([type, text]) => {
      if (type === 1) {
        html += `<span class="bg-green-900/30 text-green-300">${text}</span>`;
      } else if (type === -1) {
        html += `<span class="bg-red-900/30 text-red-300 line-through">${text}</span>`;
      } else {
        html += text;
      }
    });
    
    return html;
  };

  return (
    <div className="h-full overflow-y-auto text-white p-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Resume Review & Editor</h1>
          
          <div className="flex gap-3">
            {preview && (
              <>
                <button
                  onClick={toggleEditorMode}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
                >
                  {editorMode ? <Eye className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                  {editorMode ? 'Preview' : 'Edit Resume'}
                </button>
                
                {editorMode && (
                  <>
                    <button
                      onClick={saveEditorContent}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
                    >
                      <Save className="w-4 h-4" />
                      Save Version
                    </button>
                    
                    <button
                      onClick={exportToPDF}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
                    >
                      <Download className="w-4 h-4" />
                      Export PDF
                    </button>
                  </>
                )}
                
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
                >
                  <History className="w-4 h-4" />
                  History ({reviewHistory.length})
                </button>
              </>
            )}
          </div>
        </div>

        {/* Version and Diff Controls */}
        {editorMode && (
          <div className="mb-4 flex items-center gap-4 bg-[#1a1a1a] p-4 rounded-lg">
            <span className="text-gray-400">Version: {currentVersion}</span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showDiff}
                onChange={(e) => setShowDiff(e.target.checked)}
                className="rounded"
              />
              <span>Show Changes</span>
            </label>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Upload/Editor */}
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {!editorMode ? (
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
              ) : (
                <div className="bg-white rounded-lg border border-gray-300 overflow-hidden shadow-sm">
                  <div className="bg-gray-800 text-white px-4 py-3 flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Edit Your Resume</h3>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-300">Version {currentVersion}</span>
                      {/* Toolbar buttons */}
                      {editor && !showDiff && (
                        <div className="flex gap-1 bg-gray-700 rounded p-1">
                          <button
                            onClick={() => editor.chain().focus().toggleBold().run()}
                            className={`px-2 py-1 rounded text-xs ${editor.isActive('bold') ? 'bg-blue-600' : 'hover:bg-gray-600'}`}
                            type="button"
                          >
                            <strong>B</strong>
                          </button>
                          <button
                            onClick={() => editor.chain().focus().toggleItalic().run()}
                            className={`px-2 py-1 rounded text-xs ${editor.isActive('italic') ? 'bg-blue-600' : 'hover:bg-gray-600'}`}
                            type="button"
                          >
                            <em>I</em>
                          </button>
                          <button
                            onClick={() => editor.chain().focus().toggleUnderline().run()}
                            className={`px-2 py-1 rounded text-xs ${editor.isActive('underline') ? 'bg-blue-600' : 'hover:bg-gray-600'}`}
                            type="button"
                          >
                            <u>U</u>
                          </button>
                          <button
                            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                            className={`px-2 py-1 rounded text-xs ${editor.isActive('heading', { level: 2 }) ? 'bg-blue-600' : 'hover:bg-gray-600'}`}
                            type="button"
                          >
                            H2
                          </button>
                          <button
                            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                            className={`px-2 py-1 rounded text-xs ${editor.isActive('heading', { level: 3 }) ? 'bg-blue-600' : 'hover:bg-gray-600'}`}
                            type="button"
                          >
                            H3
                          </button>
                          <button
                            onClick={() => editor.chain().focus().toggleBulletList().run()}
                            className={`px-2 py-1 rounded text-xs ${editor.isActive('bulletList') ? 'bg-blue-600' : 'hover:bg-gray-600'}`}
                            type="button"
                          >
                            •
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  {!editorContent || editorContent.trim() === '' ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-gray-50">
                      <Loader2 className="w-12 h-12 animate-spin mb-4 text-gray-600" />
                      <p className="text-gray-600">Loading resume content...</p>
                    </div>
                  ) : showDiff ? (
                    <div 
                      className="p-6 bg-white min-h-[500px] max-h-[600px] overflow-y-auto prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: getDiffHTML() }}
                    />
                  ) : (
                    <div className="bg-white text-gray-900 min-h-[500px] max-h-[600px] overflow-y-auto">
                      <EditorContent editor={editor} />
                    </div>
                  )}
                </div>
              )}

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
                        <Sparkles className="w-5 h-5" />
                        {editorMode ? 'Re-analyze Resume' : 'Review Resume'}
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Right Column: Analysis & History */}
          <div className="space-y-6">
            {/* Current Analysis */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Latest Analysis</h2>
              <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a]">
                {loading ? (
                  <div className="flex flex-col items-center justify-center text-gray-400 py-20">
                    <Loader2 className="w-12 h-12 animate-spin mb-4" />
                    <p className="text-lg">Analyzing your resume...</p>
                  </div>
                ) : content ? (
                  <div className="p-6">
                    <div className="prose prose-invert max-w-none">
                      <Markdown>{content}</Markdown>
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

            {/* Review History */}
            {showHistory && reviewHistory.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Review History</h2>
                <div className="space-y-4">
                  {reviewHistory.map((review, index) => (
                    <div key={index} className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold">Version {review.version}</span>
                        <span className="text-sm text-gray-400">
                          {new Date(review.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-300 line-clamp-3">
                        <Markdown>{review.review}</Markdown>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewResume;