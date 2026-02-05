const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

// Pulls your key safely from Render's Environment Variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/fetch-news', async (req, res) => {
    try {
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash", 
            // Grounding with Google Search to find REAL, working URLs
            tools: [{ googleSearch: {} }],
            safetySettings: [
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            ],
        });

        const prompt = `SEARCH Google for the latest Amsterdam news from TODAY. 
        Focus on sources like AT5, Het Parool, and NOS.
        
        STRICT REQUIREMENTS:
        1. TRANSLATE ALL titles and descriptions from Dutch into English.
        2. Provide the ACTUAL direct URL to each news article (no shortened or made-up links).
        3. Format exactly like this for EVERY story:
        
        CATEGORY: [HIGHLIGHTS, CRIME, POLITICS, TRANSPORT, or CULTURE]
        TITLE: [Translated headline in English]
        SOURCE: [Source name]
        DATE: [Today's date]
        DESCRIPTION: [2-3 translated sentences in English]
        URL: [Direct link to article]
        ---`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Check if Gemini returned a valid result or a safety block
        if (!text || text.length < 50) {
            throw new Error("AI returned an empty or blocked response. Try again.");
        }

        res.json({ content: [{ text: text }] });

    } catch (error) {
        console.error("API Server Error:", error.message);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Amsterdam News Server is live on port ${PORT}`);
});
