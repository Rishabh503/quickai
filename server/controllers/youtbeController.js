import { GoogleGenAI } from "@google/genai";
import axios from "axios";

const AI = new GoogleGenAI({});
export const youtubeAnalyze = async (req, res) => {
  //data
  try {
    const { userId } = req.auth();
    const { videoUrl } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;
    console.log("clicked on the youtube analyzer");

    //plan checking
    if (plan !== "premium" && free_usage <= 0) {
      return res.json({
        success: false,
        message: "limit has reached , upgrade  for more",
      });
    }

    // videod id

    const videoId = extractVideoId(videoUrl);
    if (!videoId)
      return res
        .status(400)
        .json({ success: false, message: "invalid youtube url" });

    //  metadata lana
    const videoInfo = await fetchVideoMetadata(videoId);
    const transcript = await fetchTranscript(videoId);
    const analysis = await analyzeWithAI(transcript, videoInfo);
    console.log("analysisc", analysis);
    res.json({ success: true, videoInfo, ...analysis });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

//helpers

const extractVideoId = (url) => {
  const regExp =
    /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[7].length === 11 ? match[7] : null;
};

const fetchVideoMetadata = async (videoId) => {
  try {
    const res = await axios.get(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    );
    const data = res.data;
    return {
      title: data.title,
      channel: data.author_name,
      thumbnail: data.thumbnail_url,
      duration: "N/A",
    };
  } catch {
    return {
      title: "YouTube Video",
      channel: "Unknown Channel",
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      duration: "N/A",
    };
  }
};

const fetchTranscript = async (videoId) => {
  try {
    const transcriptUrl = `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en&fmt=json3`;
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(
      transcriptUrl
    )}`;
    const res = await axios.get(proxyUrl);
    const data = JSON.parse(res.data.contents);

    if (!data.events) throw new Error("No transcript found");

    return data.events
      .filter((event) => event.segs)
      .map((event) => event.segs.map((seg) => seg.utf8).join(""))
      .join(" ")
      .replace(/\n/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  } catch {
    return `This video discusses important concepts and provides valuable insights...`;
  }
};

const analyzeWithAI = async (transcript, videoInfo) => {
  //   const model = AI.models.generateContent({ model: "gemini-2.0-flash" });
const prompt = `
Analyze the YouTube video transcript and return a structured JSON summary with clear, non-repetitive insights.

Return JSON strictly in this format:
{
  "overview": "Brief idea of what the video covers and its purpose.",
  "topicsCovered": ["Topic 1", "Topic 2", "Topic 3"],
  "prerequisites": ["Concept or skill required before watching", "Another prereq if any"],
  "explanations": [
    {"topic": "Topic 1", "details": "Proper and easy-to-understand explanation."},
    {"topic": "Topic 2", "details": "Proper and easy-to-understand explanation."}
  ],
  "shortNotes": "Concise revision notes summarizing key points and definitions.",
  "usage": ["Real-world application 1", "Practical use 2"]
}

Video Title: ${videoInfo.title}
Channel: ${videoInfo.channel}
Transcript: ${transcript.slice(0, 8000)}
`;


  const result = await AI.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
  });
  console.log(result);
  console.log(result.text);
  const text = result.text;

  // Extract valid JSON
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  const analysis = JSON.parse(jsonMatch[0]);

  // Generate fake timestamps
  const timestamps = analysis.detailedNotes.mainConcepts.map((c, i) => ({
    time: `${i * 3}:00`,
    topic: c.topic,
  }));

  return { ...analysis, timestamps };
};
