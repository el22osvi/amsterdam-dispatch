const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
// This is the "Permission Slip" that fixes the CORS error
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/fetch-news', async (req, res) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        
        const prompt = `Find 10 recent Amsterdam news stories (from TODAY) from AT5, Het Parool, or NOS.
        IMPORTANT: Translate all titles and descriptions to English.
        IMPORTANT: Provide REAL URLs.
        
        Format each story exactly like this:
        TITLE: [Headline]
        DESCRIPTION: [2 sentences]
        SOURCE: [Source Name]
        CATEGORY: [CRIME, POLITICS, TRANSPORT, or CULTURE]
        URL: [Direct Link]
        ---`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        res.json({ content: [{ text: text }] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server Busy" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on ${PORT}`));
