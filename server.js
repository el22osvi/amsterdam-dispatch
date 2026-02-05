const express = require('express');
const cors = require('cors');
const Parser = require('rss-parser');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const parser = new Parser();

// Fixes the CORS block
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const FEEDS = [
    'https://at5.nl/rss',
    'https://www.parool.nl/amsterdam/rss.xml',
    'https://www.volkskrant.nl/voorpagina/rss.xml',
    'https://feeds.nos.nl/nosnieuwsbinnenland',
    'http://feeds.bbci.co.uk/news/world/rss.xml',
    'https://www.knmi.nl/nederland-nu/weer/verwachtingen.rss'
];

app.post('/api/fetch-news', async (req, res) => {
    try {
        let allEntries = [];
        for (const url of FEEDS) {
            try {
                const feed = await parser.parseURL(url);
                const source = url.includes('knmi') ? 'KNMI' : 
                               url.includes('at5') ? 'AT5' : 
                               url.includes('parool') ? 'Het Parool' : 
                               url.includes('volkskrant') ? 'de Volkskrant' : 
                               url.includes('nos') ? 'NOS' : 'BBC News';
                
                const items = feed.items.slice(0, 5).map(e => ({
                    title: e.title,
                    content: e.contentSnippet || e.content || "",
                    link: e.link,
                    source
                }));
                allEntries = allEntries.concat(items);
            } catch (e) { console.error("Feed error:", url); }
        }

        // Using the 2026 Stable Alias
        try {
    // USE THIS STABLE ALIAS instead of a specific version number
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" }); 

    const prompt = `... your prompt ...`;
    
    // Add a timeout safety - sometimes the AI takes too long
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    if (!text || text.length < 5) {
        throw new Error("AI returned empty or invalid text.");
    }

    res.json({ content: [{ text: text }] });
} catch (error) {
    console.error("DETAILED ERROR:", error);
    // Send the actual error back so we can see it in the browser console
    res.status(500).json({ error: error.message });
};

        const prompt = `
            Task: Curate the Amsterdam Dispatch.
            
            1. WEATHER: Find the KNMI weather entry. Extract Temp and a 2-word Status.
            2. NEWS: Categorize into: HIGHLIGHTS, CRIME, POLITICS, TRANSPORT, CULTURE, THE NETHERLANDS, INTERNATIONAL.
            3. Translate all non-English text to English.

            Format:
            WEATHER: [Temp] | [Status]
            ---
            CATEGORY: [Category]
            TITLE: [Title]
            SOURCE: [Source]
            DESCRIPTION: [1-2 sentences]
            URL: [Link]
            ---
            
            DATA:
            ${allEntries.map(e => `[${e.source}] ${e.title} - ${e.content} - ${e.link}`).join('\n')}
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        if (!text) throw new Error("AI returned empty content");

        res.json({ content: [{ text: text }] });

    } catch (error) {
        console.error("SERVER CRASH:", error.message);
        // Send actual error back to frontend so we can debug
        res.status(500).json({ error: error.message, status: "INTERNAL_ERROR" });
    }
});

const PORT = process.env.
