import { GoogleGenAI } from "@google/genai";
import axios from "axios";

const AI = new GoogleGenAI({});

export const youtubeAnalyze = async (req, res) => {
  try {
    const { videoUrl } = req.body;
    const videoId = extractVideoId(videoUrl);
    if (!videoId) return res.json({ success: false, message: "Invalid YouTube URL" });

    const videoInfo = await fetchVideoMetadata(videoId);
    const transcript = await fetchTranscript(videoId);
    const analysis = await analyzeWithAI(transcript, videoInfo);

    res.json({
      success: true,
      videoInfo,
      summary: analysis.summary,
      properExplanation: analysis.properExplanation,
      detailedNotes: analysis.detailedNotes,
      actionItems: analysis.actionItems,
      studyTopics: analysis.studyTopics,
      shortNotes: analysis.shortNotes
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const extractVideoId = (url) => {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[7].length === 11 ? match[7] : null;
};

const fetchVideoMetadata = async (videoId) => {
  try {
    const res = await axios.get(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    );
    const d = res.data;
    return {
      title: d.title,
      channel: d.author_name,
      thumbnail: d.thumbnail_url,
      duration: "N/A"
    };
  } catch {
    return {
      title: "YouTube Video",
      channel: "Unknown",
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      duration: "N/A"
    };
  }
};

const fetchTranscript = async (videoId) => {
  try {
    const transcriptUrl = `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en&fmt=json3`;
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(transcriptUrl)}`;
    const res = await axios.get(proxyUrl);
    const data = JSON.parse(res.data.contents);

    if (!data.events) throw new Error("No transcript found");

    return data.events
      .filter((e) => e.segs)
      .map((e) => e.segs.map((s) => s.utf8).join(""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
  } catch {
    return "This video covers important explanations and key concepts.";
  }
};

const analyzeWithAI = async (transcript, info) => {
  const prompt = `
You must respond ONLY with valid JSON.

{
  "summary": "Short summary of the main idea of the video.",
  "properExplanation": "Long explanation written in simple language for beginners.",
  "detailedNotes": [
    { "topic": "Topic 1", "content": "Detailed explanation" },
    { "topic": "Topic 2", "content": "Detailed explanation" }
  ],
  "shortNotes": ["Bullet point 1", "Bullet point 2", "Bullet point 3"],
  "actionItems": ["Action 1", "Action 2"],
  "studyTopics": ["Study this", "Study that"]
}

Video Title: ${info.title}
Channel: ${info.channel}
Transcript: ${transcript.slice(0, 7000)}
`;

  const result = await AI.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt
  });

  const text = result.text;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  return JSON.parse(jsonMatch[0]);
};
