const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Gemini with your API Key from Render Environment Variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/fetch-news', async (req, res) => {
    try {
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash",
            // SAFETY SETTINGS: Prevent 500 errors by allowing "borderline" news content
            safetySettings: [
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            ],
        });

        const prompt = `Find the latest news for Amsterdam TODAY from sources like AT5, Het Parool, and NOS.
        Format exactly like this for each story:
        CATEGORY: [choose one: HIGHLIGHTS, CRIME, POLITICS, TRANSPORT, or CULTURE]
        TITLE: [headline]
        SOURCE: [source name]
        DATE: [today's date]
        DESCRIPTION: [2-3 sentences summarizing the news]
        URL: [link to the news article]
        ---`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        
        // CRITICAL CHECK: Ensure the AI actually returned a result before trying to read it
        if (!response.candidates || response.candidates[0].finishReason === 'SAFETY') {
            return res.json({ 
                content: [{ text: "CATEGORY: HIGHLIGHTS\nTITLE: News Dispatch Paused\nSOURCE: System\nDATE: Now\nDESCRIPTION: Some news items were flagged by safety filters. Please try refreshing again.\nURL: #\n---" }] 
            });
        }

        const text = response.text();
        res.json({ content: [{ text: text }] });

    } catch (error) {
        console.error("Gemini API Error:", error);
        // Returns the actual error message so you can see it in your browser console
        res.status(500).json({ error: error.message });
    }
});

// Port configuration for Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Bulletproof server is running on port ${PORT}`);
});
