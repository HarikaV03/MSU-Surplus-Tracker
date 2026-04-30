import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function GET() {
  const itemsToAnalyze = [
    { id: "1", name: "Dell Latitude 5420 Laptop", cond: "Fair" },
    { id: "2", name: "Herman Miller Aeron Chair", cond: "Good" },
    { id: "3", name: "Sony PS5 Console", cond: "New" },
    { id: "4", name: "Apple iPad Pro 12.9 (M2)", cond: "Good" },
    { id: "5", name: "Epson PowerLite Projector", cond: "Poor" },
    { id: "6", name: "Steelcase Gesture Chair", cond: "Fair" },
    { id: "7", name: "Microsoft Surface Pro 9", cond: "New" },
    { id: "8", name: "Cisco C9200L Switch", cond: "Good" },
    { id: "9", name: "Samsung 65-inch 4K TV", cond: "Fair" },
    { id: "10", name: "Polycom Trio 8800", cond: "Good" },
    { id: "11", name: "MacBook Pro 14-inch (M3)", cond: "New" },
    { id: "12", name: "HP EliteDesk 800 G6", cond: "Good" },
    { id: "13", name: "Logitech MX Master 3S", cond: "Fair" },
    { id: "14", name: "Dell 27-inch 4K Monitor", cond: "Poor" },
    { id: "15", name: "Blue Yeti USB Microphone", cond: "Good" },
    { id: "16", name: "Canon EOS R6 Camera", cond: "Fair" },
    { id: "17", name: "Steelcase Leap V2 Chair", cond: "Good" },
    { id: "18", name: "Lenovo ThinkPad X1 Carbon", cond: "New" },
    { id: "19", name: "Netgear Nighthawk Router", cond: "Fair" },
    { id: "20", name: "Apple AirPods Max", cond: "Good" },
    { id: "21", name: "Sony WH-1000XM5", cond: "Fair" },
    { id: "22", name: "Wacom Intuos Pro Tablet", cond: "Good" },
    { id: "23", name: "Razer BlackWidow Keyboard", cond: "Poor" },
    { id: "24", name: "Nintendo Switch (OLED)", cond: "Good" },
    { id: "25", name: "JBL PartyBox 310", cond: "Fair" }
  ];

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
      Act as an MSU Surplus specialist. For the provided list of 25 items, generate realistic secondary market prices.
      Return the data as a JSON array where each object has "id", "msu", "ebay", and "amazon".
      
      Requirements: 
      - "msu" should be the lowest (surplus price).
      - "ebay" and "amazon" should be realistic market rates.
      - Ensure prices reflect the Condition (New/Good/Fair/Poor).

      Items: ${itemsToAnalyze.map(i => `${i.id}: ${i.name} (${i.cond})`).join(", ")}
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanJson = responseText.replace(/```json|```/g, "").trim();
    const aiPrices = JSON.parse(cleanJson);

    const finalData = itemsToAnalyze.map(item => ({
      ...item,
      prices: aiPrices.find(p => p.id === item.id) || { msu: "0", ebay: "0", amazon: "0" }
    }));

    return NextResponse.json(finalData);

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
