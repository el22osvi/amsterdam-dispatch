const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();

// This MUST be the first middleware to fix the CORS error
app.use(cors({
    origin: 'https://el22osvi.github.io'
}));
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/fetch-news', async (req, res) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        
        // We remove the Search Tool to make this 5x faster
        const prompt = `Provide 10 recent Amsterdam news stories from AT5, Het Parool, and NOS.
        Translate titles and descriptions to English.
        Provide direct URLs.
        Format:
        TITLE: [headline]
        DESCRIPTION: [summary]
        SOURCE: [source]
        CATEGORY: [CRIME, POLITICS, TRANSPORT, or CULTURE]
        URL: [link]
        ---`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        res.json({ content: [{ text: text }] });
    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server live on ${PORT}`));
