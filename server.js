const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
app.use(cors());
app.use(express.json());

// Securely access your key from Render's dashboard settings
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY, 
});

app.post('/api/fetch-news', async (req, res) => {
  try {
    const msg = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4000,
      messages: [{
        role: "user",
        content: "Search for the latest Amsterdam news from Dutch sources (AT5, Het Parool, NOS, 112 Amsterdam). Format as: CATEGORY: [category] --- TITLE: [headline] --- SOURCE: [source] --- DATE: [date] --- DESCRIPTION: [desc] --- URL: [url]. Categories: HIGHLIGHTS, CRIME, POLITICS, TRANSPORT, CULTURE."
      }],
    });
    res.json(msg);
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: "Failed to fetch news" });
  }
});

// Render provides a PORT variable automatically; default to 3000 locally
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
