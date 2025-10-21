import { clerkClient } from "@clerk/express";
import OpenAI from "openai";
import { sql } from "../configs/db.js";
import axios from "axios";
import {v2 as cloudinary} from 'cloudinary'
import fs from "fs"
import { GoogleGenAI } from "@google/genai";
// import pdf from "pdf-parse/lib/pdf-parse.js"
import * as pdfParse from "pdf-parse";


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
    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "limit has reached , upgrade  for more",
      });
    }
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

    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "limit has reached , upgrade  for more",
      });
    }
    const response = await AI.chat.completions.create({
      model: "gemini-2.5-flash",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 100,
    });

    const content = response.choices[0].message.content;
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

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "Subscribe to use this feature",
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
          free_usage: free_usage + 1,
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
    const { userId } = req.auth();
    // const { prompt, publish } = req.body;
    const {image}=req.file;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "Subscribe to use this feature",
      });
    }

    const {secure_url}=await cloudinary.uploader.upload(image.path,{
        transformation:[
          {
            effect:'background_removal',
            background_removal:'remove_the_background'
          }
        ]
    })
    
    console.log(secure_url)


    await sql`INSERT INTO creations(user_id,prompt,content,type)
    values (${userId},"remove the background",${secure_url},'image')`;
   

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
    const {image}=req.file;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "Subscribe to use this feature",
      });
    }

    const {public_id}=await cloudinary.uploader.upload(image.path)
    
    const imageUrl=cloudinary.url(public_id,{
      transformation:[{
        effect:`gen_remove:${object}`
      }],
      resource_type:'image'
    })
    // console.log(secure_url)


    await sql`INSERT INTO creations(user_id,prompt,content,type)
    values (${userId},${`removed the ${object} from image`},${imageUrl},'image')`;
   

    res.json({ success: true, content:imageUrl });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
export const resumeReview = async (req, res) => {
  try {
    const { userId } = req.auth();
    // const { object } = req.body;
    const resume=req.file;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "Subscribe to use this feature",
      });
    }
    //5mb se bada
    if(resume.size>5*1024*1024){
      return res.json({success:false,message:"resume file size exceeds allowed size(5mb"})
    }
    const dataBuffer=fs.readFileSync(resume.path)
    const pdfData=await pdf(dataBuffer)

    const prompt=`Review the following resume and provide constructive feedback on is strenght, weakness,and areas of improvement. Resume Content :\n\n${pdfData.text} `
    
        const response = await AI.chat.completions.create({
      model: "gemini-2.5-flash",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content=response.choices[0].message.content

    await sql`INSERT INTO creations(user_id,prompt,content,type)
    values (${userId},"review the uploaded resume",${content},'review-resumem')`;
   

    res.json({ success: true, content:content });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};