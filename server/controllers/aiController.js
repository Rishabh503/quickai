import { clerkClient } from "@clerk/express";
import { GoogleGenAI } from "@google/genai";
import axios from "axios";
import { v2 as cloudinary } from 'cloudinary';
import { sql } from "../configs/db.js";
// import pdf from "pdf-parse/lib/pdf-parse.js"
// import * as pdfParse from "pdf-parse";
// import * as pdf from "pdf-parse";
import { PDFParse } from 'pdf-parse';
// import pdf from "pdf-parse";


// import { AlwaysCompare } from "three/src/constants.js";
// const AI = new OpenAI({
//   apiKey: process.env.GEMINI_API_KEY,
//   baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
// });

const AI=new GoogleGenAI({})
export const generateArticle = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt, length } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;
    console.log("called")

    //lliife time freee
    // if (plan !== "premium" && free_usage >= 10) {
    //   return res.json({
    //     success: false,
    //     message: "limit has reached , upgrade  for more",
    //   });
    // }
    console.log("Body received:", req.body);

    console.log(prompt)
    
    const response = await AI.models.generateContent({
      model: "gemini-2.0-flash",
     contents:prompt,
     config:{
      systemInstruction:"You are a Article writer and you write good articles for all the users you dont please them but instead play on the facts give the proper and very good information on the topic , if you think you cant answer it you throw an error directly"
     }
    });

    const content = response.text
    console.log(content);
    await sql`INSERT INTO creations(user_id,prompt,content,type)
    values (${userId},${prompt},${content},'article')`;
    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1,
        },
      });
    }

    res.json({ success: true, content });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
export const generateBlogTitle = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;
console.log("clicked blog titles")
//life  time free


    // if (plan !== "premium" && free_usage >= 10) {
    //   return res.json({
    //     success: false,
    //     message: "limit has reached , upgrade  for more",
    //   });
    // }

    console.log(prompt)

     const response = await AI.models.generateContent({
      model: "gemini-2.0-flash",
     contents:prompt,
     config:{
      systemInstruction:"You are an individual who is great writer at writing the titles for an blog based on the prompt and the keyword it has , return the user good 5 blog titles based on his prompt , make it attractive acording to the new genration trends of the social media, aesthtic lifestyle  "
     }
    });

    const content = response.text
    console.log(content);
    await sql`INSERT INTO creations(user_id,prompt,content,type)
    values (${userId},${prompt},${content},'blog-title')`;
    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1,
        },
      });
    }

    res.json({ success: true, content });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
export const generateImage = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt, publish } = req.body;
    
    const plan = req.plan;
      const free_usage = req.free_usage;
    console.log("clicked the generate image ")
     if (plan !== "premium" && free_usage <=0) {
      return res.json({
        success: false,
        message: "limit has reached , upgrade  for more",
      });
    }


    const formData = new FormData();
    formData.append("prompt", prompt);
    const {data}=await axios.post('https://clipdrop-api.co/text-to-image/v1',formData,{
        headers:{'x-api-key':process.env.CLIPDROP_API_KEY},
        responseType:"arraybuffer"
    })
    console.log(data)
    const base64Image=`data:image/png;base64,${Buffer.from(data,'binary').toString('base64')}`

    const {secure_url}=await cloudinary.uploader.upload(base64Image)
    console.log(secure_url)


    await sql`INSERT INTO creations(user_id,prompt,content,type,publish)
    values (${userId},${prompt},${secure_url},'image',${publish?? false})`;
 if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage - 1,
        },
      });
    }

    res.json({ success: true, content:secure_url });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
export const removeImageBackground = async (req, res) => {
  try {
    console.log("clicked the remove image bkg")
    const { userId } = req.auth();
    // const { prompt, publish } = req.body;
    const image=req.file;
    const plan = req.plan;
     const free_usage = req.free_usage;
    console.log(plan)
    console.log("clicked the remove image bkg2")
    if (plan !== "premium" && free_usage <=0) {
      return res.json({
        success: false,
        message: "limit has reached , upgrade  for more",
      });
    }

    console.log("Reacehd cloudinary")
    const {secure_url}=await cloudinary.uploader.upload(image.path,{
        transformation:[
          {
            effect:'background_removal',
            background_removal:'remove_the_background'
          }
        ]
    })
    
    console.log(secure_url)

    const prompt="remove the bg"
//     const columns = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'creations'`;
// console.log(columns);

    await sql`
  INSERT INTO "creations" ("user_id", "prompt", "content", "type")
  VALUES (${userId}, 'remove the background', ${secure_url}, 'image')
  
`;

     if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage - 1,
        },
      });
    }

    res.json({ success: true, content:secure_url });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const removeImageObject = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { object } = req.body;
    const {path}=req.file;
    const plan = req.plan;
     const free_usage = req.free_usage;
console.log("clicked on the remove image obj")
       if (plan !== "premium" && free_usage <=0) {
      return res.json({
        success: false,
        message: "limit has reached , upgrade  for more",
      });
    }

    const {public_id}=await cloudinary.uploader.upload(path)
    
    const imageUrl=cloudinary.url(public_id,{
      transformation:[{
        effect:`gen_remove:${object}`
      }],
      resource_type:'image'
    })
    console.log(imageUrl)


    await sql`INSERT INTO creations(user_id,prompt,content,type)
    values (${userId},${`removed the ${object} from image`},${imageUrl},'image')`;
     if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage - 1,
        },
      });
    }

    res.json({ success: true, content:imageUrl });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
export const resumeReview = async (req, res) => {
  try {
    console.log("clickd resume review")
    const { userId } = req.auth();
    // const { object } = req.body;
    const resume = req.file;
     const free_usage = req.free_usage;
    const plan = req.plan;

    if (!resume) {
      return res.json({ success: false, message: "Resume file is required" });
    }

    if (plan !== "premium" && free_usage <=0) {
      return res.json({
        success: false,
        message: "limit has reached , upgrade  for more",
      });
    }


    // 5mb se bada
    if (resume.size > 5 * 1024 * 1024) {
      return res.json({ success: false, message: "resume file size exceeds allowed size (5mb)" });
    }

   console.log(resume)
    const parser=new PDFParse({url:resume.path})
    const pdfText = await parser.getText();
	console.log(pdfText.text);
    const prompt = `Review the following resume and provide constructive feedback on its strength, weakness, and areas of improvement. Resume Content:\n\n${pdfText.text}`;

    const response = await AI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt, // for string input
      config: {
        systemInstruction: `You are a professional resume reviewer and career advisor. Review the resume carefully and provide constructive feedback to improve its impact. Focus on:

Formatting and Structure – Is it clean, readable, and well-organized?

Clarity and Conciseness – Are points clear, concise, and free of jargon?

Content Relevance – Are the experiences, skills, and projects relevant to the target roles?

Achievements vs Responsibilities – Are achievements highlighted instead of just listing responsibilities?

Language and Grammar – Check for spelling, grammar, and professional tone.

ATS Friendliness – Is it optimized for Applicant Tracking Systems?

Impactful Summary & Keywords – Does the resume have a strong summary and use relevant keywords?

Provide:

Specific actionable suggestions for improvement.

Highlight strengths as well as areas that need changes.

Optional: Suggest a few impactful ways to reword bullet points for clarity and effect.`
      }
    });

    // replaced gemini-google sdk with gemini
    //     const response = await AI.chat.completions.create({
    //   model: "gemini-2.5-flash",
    //   messages: [
    //     {
    //       role: "user",
    //       content: prompt,
    //     },
    //   ],
    //   temperature: 0.7,
    //   max_tokens: 1000,
    // });

    const content = response.text;

    console.log(content)

    await sql`INSERT INTO creations(user_id,prompt,content,type)
      values (${userId}, 'review the uploaded resume', ${content}, 'review-resume')`;
console.log("before",free_usage)

  if (plan != "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage - 1,
        },
      });
    }
    console.log("after",free_usage)
    res.json({ success: true, content: content });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};


