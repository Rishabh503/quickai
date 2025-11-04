// Backend API endpoints
import { clerkClient } from "@clerk/express";
import { GoogleGenAI } from "@google/genai";
import axios from "axios";
import { v2 as cloudinary } from 'cloudinary';
import { sql } from "../configs/db.js";
// import pdf from "pdf-parse/lib/pdf-parse.js"
// import * as pdfParse from "pdf-parse";
// import * as pdf from "pdf-parse";
import { PDFParse } from 'pdf-parse';
import fs from 'fs';
import path from 'path';

const AI=new GoogleGenAI({})


export const extractResumeText = async (req, res) => {
  try {
    const { userId } = req.auth();
    const file = req.file;

    if (!file) {
      return res.json({ success: false, message: "File required" });
    }

    console.log('Extracting text from:', file.path);
    console.log('File size:', file.size);

    // Use the same PDFParse method as your working route
    const parser = new PDFParse({ url: file.path });
    const pdfText = await parser.getText();
    
    console.log('PDF Text extracted, length:', pdfText.text.length);

    if (!pdfText.text || pdfText.text.trim().length === 0) {
      // Clean up file
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      
      return res.json({ 
        success: false, 
        message: "Could not extract text from PDF. It might be an image-based PDF or encrypted." 
      });
    }

    // Convert plain text to HTML with formatting
    const htmlContent = convertTextToHTML(pdfText.text);

    // Clean up uploaded file
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    res.json({ 
      success: true, 
      htmlContent,
      textLength: pdfText.text.length
    });

  } catch (error) {
    console.error('Extract text error:', error);
    
    // Clean up file on error
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      success: false, 
      message: `Failed to extract text: ${error.message}` 
    });
  }
};

// Helper function to convert text to HTML
function convertTextToHTML(text) {
  const lines = text.split('\n');
  let htmlContent = '<div style="font-family: Arial, sans-serif; line-height: 1.6;">';
  
  for (let line of lines) {
    const trimmed = line.trim();
    
    if (!trimmed) {
      htmlContent += '<br>';
      continue;
    }
    
    // Headers (all caps, short lines, likely section headers)
    if (trimmed.length < 60 && trimmed === trimmed.toUpperCase() && /^[A-Z\s&]+$/.test(trimmed)) {
      htmlContent += `<h3 style="margin-top: 16px; margin-bottom: 8px; font-weight: bold; color: #333;">${trimmed}</h3>`;
    }
    // Bullet points
    else if (trimmed.match(/^[•\-\*◦▪]\s/)) {
      htmlContent += `<p style="margin-left: 24px; margin-top: 4px; margin-bottom: 4px;">${trimmed}</p>`;
    }
    // Contact info (email, phone, links)
    else if (trimmed.match(/@|linkedin\.com|github\.com|portfolio/) || trimmed.match(/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/)) {
      htmlContent += `<p style="margin: 4px 0; color: #666;"><em>${trimmed}</em></p>`;
    }
    // Date ranges (likely job dates)
    else if (trimmed.match(/\d{4}\s*[-–]\s*(\d{4}|Present|Current)/i)) {
      htmlContent += `<p style="margin: 4px 0; color: #666; font-style: italic;">${trimmed}</p>`;
    }
    // Regular text
    else {
      htmlContent += `<p style="margin: 6px 0;">${trimmed}</p>`;
    }
  }
  
  htmlContent += '</div>';
  return htmlContent;
}



// 2. Enhanced resume review with history context
export const resumeReviewNew = async (req, res) => {
  try {
    const { userId } = req.auth();
    const resume = req.file;
    const { htmlContent, version, previousReview } = req.body;
    const free_usage = req.free_usage;
    const plan = req.plan;

    if (!resume && !htmlContent) {
      return res.json({ success: false, message: "Resume or content required" });
    }

    if (plan !== "premium" && free_usage <= 0) {
      return res.json({
        success: false,
        message: "Limit reached, upgrade for more",
      });
    }

    let resumeText = '';
    
    if (htmlContent) {
      // Strip HTML tags for AI analysis
      resumeText = htmlContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    } else {
      const parser = new PDFParse({ url: resume.path });
      const pdfText = await parser.getText();
      resumeText = pdfText.text;
    }

    // Build contextual prompt
    let prompt = `Review the following resume and provide constructive feedback.\n\n`;
    
    if (previousReview && version > 1) {
      prompt += `IMPORTANT: This is version ${version} of the resume. Previous feedback was:\n${previousReview}\n\n`;
      prompt += `Focus on:\n`;
      prompt += `1. Whether previous suggestions were implemented\n`;
      prompt += `2. New issues or improvements needed\n`;
      prompt += `3. Progress made since last review\n\n`;
    }
    
    prompt += `Resume Content:\n\n${resumeText}`;

    const response = await AI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        systemInstruction: `You are a professional resume reviewer. ${
          version > 1 
            ? 'This is a revised version. Compare it with previous feedback and note improvements or remaining issues.' 
            : 'Provide comprehensive feedback.'
        }
        
        Focus on:
        - Formatting and Structure
        - Clarity and Conciseness
        - Content Relevance
        - Achievements vs Responsibilities
        - Language and Grammar
        - ATS Friendliness
        - Keywords and Summary
        
        ${version > 1 ? `
        Structure your response as:
        ## Progress Review
        - What improvements were made
        - What suggestions were implemented
        
        ## Remaining Issues
        - What still needs work
        
        ## New Suggestions
        - Additional improvements
        ` : `
        Provide specific actionable suggestions with examples.
        `}`
      }
    });

    const content = response.text;

    // Save to database with version tracking
    await sql`
      INSERT INTO creations(user_id, prompt, content, type, version)
      VALUES (${userId}, ${prompt}, ${content}, 'review-resume', ${version || 1})
    `;
    
    // Save to review history
    await sql`
      INSERT INTO review_history(user_id, version, review_content, created_at)
      VALUES (${userId}, ${version || 1}, ${content}, NOW())
    `;

    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage - 1,
        },
      });
    }

    res.json({ 
      success: true, 
      content, 
      version: version || 1,
      changes: [] // You can add change detection logic here
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// 3. Save resume version
export const saveResumeVersion = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { content, version } = req.body;

    await sql`
      INSERT INTO resume_versions(user_id, version_number, content, created_at)
      VALUES (${userId}, ${version}, ${content}, NOW())
    `;

    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// 4. Get review history
export const getResumeHistory = async (req, res) => {
  try {
    const { userId } = req.auth();

    const history = await sql`
      SELECT version, review_content as review, created_at as timestamp
      FROM review_history
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 10
    `;

    res.json({ success: true, history: history.rows });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// 5. Export to PDF
export const exportResumePDF = async (req, res) => {
  try {
    const { htmlContent } = req.body;
    
    // Use a library like puppeteer or html-pdf-node for server-side PDF generation
    // Or use a service like PDFShift API
    
    // Example with html-pdf-node:
    const pdf = require('html-pdf-node');
    
    const file = { content: htmlContent };
    const options = { format: 'A4' };
    
    const pdfBuffer = await pdf.generatePdf(file, options);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.send(pdfBuffer);
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};