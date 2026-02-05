const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

// Initialize with your GEMINI_API_KEY from Render Environment Variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/fetch-news', async (req, res) => {
    try {
        // Use gemini-3-flash-preview for real-time web grounding
        const model = genAI.getGenerativeModel({ 
            model: "gemini-3-flash-preview",
            // This is the magic tool that stops URL hallucinations
            tools: [{ googleSearch: {} }],
            safetySettings: [
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            ],
        });

        const prompt = `SEARCH Google for the latest local Amsterdam news stories from TODAY. 
        Focus on sources like AT5, Het Parool, and NOS.
        
        CRITICAL INSTRUCTIONS:
        1. Translate ALL headlines and descriptions from Dutch into English.
        2. You MUST provide the actual, direct URL for each story.
        3. Format exactly like this for EVERY article:
        
        CATEGORY: [HIGHLIGHTS, CRIME, POLITICS, TRANSPORT, or CULTURE]
        TITLE: [English Title]
        SOURCE: [Source Name]
        DATE: [Today's Date]
        DESCRIPTION: [2-3 sentences in English]
        URL: [The real link to the article]
        ---`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Send back the data in the format your index.html expects
        res.json({ content: [{ text: text }] });

    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Amsterdam Dispatch Server Live on port ${PORT}`);
});
