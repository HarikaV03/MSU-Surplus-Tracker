import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    const { itemName, category } = await request.json();

    
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const prompt = `Write a professional, concise 2-sentence description for a university surplus inventory listing. 
    Item: ${itemName}
    Category: ${category}
    Focus on technical specs and professional tone.`;

    const result = await model.generateContent(prompt);
    const description = result.response.text().trim();

    return NextResponse.json({ description });
  } catch (error) {
    console.error("Gemini Error:", error);
    return NextResponse.json({ error: "Failed to generate description" }, { status: 500 });
  }
}
