const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

// This matches the variable name you set in Render's Environment tab
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/fetch-news', async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
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
    const text = response.text();

    // Send the response back in a format your index.html understands
    res.json({ content: [{ text: text }] });
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: "Failed to fetch news from Gemini" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
