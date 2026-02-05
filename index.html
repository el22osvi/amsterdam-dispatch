const express = require('express');
const cors = require('cors');
const Parser = require('rss-parser');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const parser = new Parser();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const FEEDS = [
    'https://at5.nl/rss',
    'https://www.parool.nl/amsterdam/rss.xml',
    'https://www.volkskrant.nl/voorpagina/rss.xml',
    'https://feeds.nos.nl/nosnieuwsbinnenland',
    'http://feeds.bbci.co.uk/news/world/rss.xml',
    'https://www.knmi.nl/nederland-nu/weer/verwachtingen.rss' // KNMI Weather Feed
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

        const model = genAI.getGenerativeModel({ 
            model: "gemini-3-flash", // 2026 Stable Model
            tools: [{ googleSearch: {} }] 
        });

        const prompt = `
            Task: Curate the Amsterdam Dispatch.
            
            1. WEATHER: Find the KNMI weather entry. Extract the current Temp and a 2-word Status.
            2. NEWS: Categorize the remaining items into: HIGHLIGHTS, CRIME, POLITICS, TRANSPORT, CULTURE, THE NETHERLANDS, INTERNATIONAL.
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
        res.json({ content: [{ text: result.response.text() }] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Dispatch failed" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Intelligence Server Live`));
