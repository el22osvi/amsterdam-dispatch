const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/fetch-news', async (req, res) => {
    try {
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash",
            tools: [{ googleSearch: {} }],
            // Increase output limit to ensure a long list isn't cut off
            generationConfig: { maxOutputTokens: 2048 }
        });

        const prompt = `SEARCH Google for at least 10 different news stories in Amsterdam from TODAY (AT5, Het Parool, NOS).
        
        RULES:
        1. You MUST provide at least 2 stories for EACH category: HIGHLIGHTS, CRIME, POLITICS, TRANSPORT, CULTURE.
        2. TRANSLATE everything to English.
        3. For the URL, provide the FULL DIRECT HTTPS link.
        
        Format your response exactly like this for every single story:
        CATEGORY: [Category Name]
        TITLE: [English Title]
        SOURCE: [Source]
        DATE: [Today's Date]
        DESCRIPTION: [2-3 sentences]
        URL: [Direct Link]
        ---`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ content: [{ text: text }] });
    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server live on ${PORT}`));
