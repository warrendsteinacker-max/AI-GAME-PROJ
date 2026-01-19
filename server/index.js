// import express from 'express';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import { GoogleGenerativeAI } from "@google/generative-ai";

// dotenv.config();

// const app = express();
// app.use(cors());
// app.use(express.json());

// // Initialize Gemini with the correct environment variable
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyCwIV9sjQzFexvJ4FZ7YUL7H4WB677rPMg");

// /**
//  * Helper: Safely cleans and parses JSON from AI text
//  * Gemini sometimes wraps JSON in markdown blocks (```json ... ```)
//  */
// const parseAIResponse = (text) => {
//     try {
//         const cleaned = text.replace(/```json|```/g, "").trim();
//         return JSON.parse(cleaned);
//     } catch (e) {
//         console.error("Parse Error. Raw AI output:", text);
//         // Fallback object to prevent frontend crash
//         return {
//             title: "Timeline Glitch",
//             scenario: "The AI failed to materialize a stable reality. Proceed with caution.",
//             options: ["Stabilize Reality", "Ignore Glitch"]
//         };
//     }
// };

// /**
//  * 1. GENERATE SCENARIO
//  * Triggered every time a player clicks to place a planet.
//  * The AI generates a unique dilemma based on the selected timeline.
//  */
// app.post('/api/generate-scenario', async (req, res) => {
//     const { theme, civHealth, planetData, gameDuration } = req.body;
    
//     // FIX: Using gemini-1.5-flash - this is the universally accepted ID for v1beta
//     const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

//     const prompt = `
//         You are an unpredictable Game Master for "Astra: The Centrifugal Frontier". 
//         Theme: ${theme}. 
//         Current Stability: ${civHealth}%. 
//         Target Playtime: ${gameDuration} minutes.
//         New Planet Coords: [${planetData?.x}, ${planetData?.z}].

//         TASK:
//         Invent a unique, high-stakes dilemma specific to this theme. 
//         DO NOT use generic examples (no soul-binding, advertisement satellites, or simple 'Zeus' tropes).
        
//         The choice must be "Tricky":
//         - Path A should prioritize Spin Speed (Pushing the win condition).
//         - Path B should prioritize Civilization Health (Survival/Stability).
        
//         Return ONLY JSON: 
//         {
//             "title": "A short, immersive event title",
//             "scenario": "A 2-3 sentence description of the crisis/opportunity",
//             "options": ["Option for Path A", "Option for Path B"]
//         }
//     `;

//     try {
//         const result = await model.generateContent(prompt);
//         const text = result.response.text();
//         res.json(parseAIResponse(text));
//     } catch (err) {
//         console.error("AI Error:", err);
//         res.status(500).json({ error: "The timeline has fractured. Try again." });
//     }
// });

// /**
//  * 2. JUDGE PLAYER RESPONSE
//  * Triggered after the player picks an option.
//  * Translates the choice into 3D physics changes.
//  */
// app.post('/api/judge-response', async (req, res) => {
//     const { scenario, playerAnswer, theme, gameDuration } = req.body;
    
//     // FIX: Using gemini-1.5-flash - this is the universally accepted ID for v1beta
//     const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

//     const prompt = `
//         In a ${theme} universe, the player faced: "${scenario}".
//         They chose: "${playerAnswer}".

//         Based on the complexity of the choice and the target game length of ${gameDuration} minutes:
//         1. 'newSpinSpeed': (0.01 to 0.08). 0.08 triggers the WIN condition.
//         2. 'tugMultiplier': (0.5 to 2.5). Higher means the planet drifts away faster from centrifugal force.
//         3. 'healthImpact': (-20 to +10). Direct impact on survival.

//         Return ONLY JSON:
//         {
//             "outcome": "A vivid description of the consequences",
//             "newSpinSpeed": number,
//             "tugMultiplier": number,
//             "healthImpact": number
//         }
//     `;

//     try {
//         const result = await model.generateContent(prompt);
//         const text = result.response.text();
//         res.json(parseAIResponse(text));
//     } catch (err) {
//         console.error("Judging Error:", err);
//         res.status(500).json({ error: "The void failed to judge your choice." });
//     }
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`🚀 Astra Game Server running on port ${PORT}`));

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { router } from '../routes'

dotenv.config();

const app = express();
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5176']
}));
app.use(express.json());

app.use(router)

const API_KEY = process.env.GEMINI_API_KEY || "AIzaSyCwIV9sjQzFexvJ4FZ7YUL7H4WB677rPMg";
const ai = new GoogleGenAI({ apiKey: API_KEY });

// 2026 Stable Model
const MODEL_NAME = 'gemini-2.5-flash';

const parseAIResponse = (text) => {
    try {
        const cleaned = text.replace(/```json|```/g, "").trim();
        return JSON.parse(cleaned);
    } catch (e) {
        console.error("Parse Error. Raw AI output:", text);
        return {
            title: "Timeline Glitch",
            scenario: "The AI failed to materialize a stable reality. Proceed with caution.",
            options: ["Stabilize Reality", "Ignore Glitch"]
        };
    }
};

/**
 * 1. GENERATE SCENARIO
 */


app.post('/api/generate-scenario', async (req, res) => {
    const { theme, civHealth, planetData, gameDuration } = req.body;
    
    // YOUR ORIGINAL PROMPT
    const prompt = `
        You are an unpredictable Game Master for "Astra: The Centrifugal Frontier". 
        Theme: ${theme}. 
        Current Stability: ${civHealth}%. 
        Target Playtime: ${gameDuration} minutes.
        New Planet Coords: [${planetData?.x}, ${planetData?.z}].

        TASK:
        Invent a unique, high-stakes dilemma specific to this theme. 
        DO NOT use generic examples (no soul-binding, advertisement satellites, or simple 'Zeus' tropes).
        
        The choice must be "Tricky":
        - Path A should prioritize Spin Speed (Pushing the win condition).
        - Path B should prioritize Civilization Health (Survival/Stability).
        
        Return ONLY JSON: 
        {
            "title": "A short, immersive event title",
            "scenario": "A 2-3 sentence description of the crisis/opportunity",
            "options": ["Option for Path A", "Option for Path B"]
        }
    `;

    try {
        const result = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: [{ role: 'user', parts: [{ text: prompt }] }]
        });
        res.json(parseAIResponse(result.text));
    } catch (err) {
        console.error("AI Error:", err);
        res.status(500).json({ error: "The timeline has fractured. Try again." });
    }
});

/**
 * 2. JUDGE PLAYER RESPONSE
 */
app.post('/api/judge-response', async (req, res) => {
    const { scenario, playerAnswer, theme, gameDuration } = req.body;

    // YOUR ORIGINAL PROMPT
    const prompt = `
        In a ${theme} universe, the player faced: "${scenario}".
        They chose: "${playerAnswer}".

        Based on the complexity of the choice and the target game length of ${gameDuration} minutes:
        1. 'newSpinSpeed': (0.01 to 0.08). 0.08 triggers the WIN condition.
        2. 'tugMultiplier': (0.5 to 2.5). Higher means the planet drifts away faster from centrifugal force.
        3. 'healthImpact': (-20 to +10). Direct impact on survival.

        Return ONLY JSON:
        {
            "outcome": "A vivid description of the consequences",
            "newSpinSpeed": number,
            "tugMultiplier": number,
            "healthImpact": number
        }
    `;

    try {
        const result = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: [{ role: 'user', parts: [{ text: prompt }] }]
        });
        res.json(parseAIResponse(result.text));
    } catch (err) {
        console.error("Judging Error:", err);
        res.status(500).json({ error: "The void failed to judge your choice." });
    }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Astra Game Server running on port ${PORT}`));

/////