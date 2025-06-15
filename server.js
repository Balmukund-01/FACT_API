// server.js
require("dotenv").config();
const express = require("express");
const fs = require("fs");
const axios = require("axios");
const cron = require("node-cron");
const scrapeFacts = require("./scraper");

const app = express();
const PORT = process.env.PORT || 3000;

// 🧠 Load facts from local cache
function getCachedFact() {
  try {
    const data = fs.readFileSync("facts.json");
    const facts = JSON.parse(data);
    if (!Array.isArray(facts) || !facts.length) throw new Error("No facts in cache");
    const random = facts[Math.floor(Math.random() * facts.length)];
    return { source: "cache", fact: random , Made_by: "Balmukund", note: "Its a Free API, you can use it in your projects."};
  } catch (err) {
    console.warn("⚠️ Cache error:", err.message);
    return null;
  }
}

// 🌌 Google fallback: space-specific queries, clean and long fact extraction
async function getFactFromGoogle() {
  const spaceQueries = [
    "interesting fact about space",
    "NASA space fact",
    "space facts",
    "Interesting astronomy fact",
    "space fact of the day",
    "space fact on wikipedia",
    "space facts physics",
    "astronomy trivia",
    "fun fact about planets",
    "cosmic facts",
    "did you know about universe",
    "solar system fun facts",
    "weird facts about black holes",
    "funny space facts for kids",
    "science facts about galaxies",
    "NASA trivia questions",
    "moon exploration facts",
    "facts about astronauts",
    "rocket science trivia",
    "what's the largest star fact",
    "milky way galaxy facts",
    "facts about Mars mission",
    "interesting nebula facts",
    "facts about comets",
    "asteroids vs meteors facts",
    "space exploration milestones",
    "history of space travel",
    "famous space missions",
    "space technology advancements",
    "future of space exploration",
    "space phenomena explained",
    "black hole mysteries",
    "exoplanet discoveries",
    "space telescopes and their findings",
    "Hubble Space Telescope discoveries",
    "James Webb Space Telescope facts",
    "space weather phenomena",
    "theories about dark matter",
    "theories about dark energy",
    "space-time and relativity",
    "theories about the Big Bang",
    "theories about the universe",
    "theories about black holes",
    "theories about the solar system",
    "theories about the multiverse",
    "theories about extraterrestrial life",
    "theories about the origin of the universe",
    "theories about the end of the universe",
    "theories about the expansion of the universe",
    "theories about cosmic inflation",
    "theories about quantum mechanics",
    "theories about string theory",
    "theories about parallel universes",
    "theories about time travel",
    "theories about wormholes",
    "theories about gravitational waves",
    "theories about the speed of light",
    "theories about the fabric of space-time",
    "theories about the nature of reality",
    "theories about the universe's fate",
    "theories about the nature of black holes",
    "theories about the nature of dark matter",
    "theories about the nature of dark energy",
    "theories about the nature of gravity",
    "theories about the nature of time",
    "theories about the nature of space",
    "theories about the nature of the cosmos",
    "theories about the nature of existence",
    "theories about the nature of consciousness",
    "theories about the nature of life in the universe",
    "theories about the nature of the universe's structure",
    "theories about the nature of the universe's origin",
    "theories about the nature of the universe's evolution",  
    "interesting fact about space today",
    "interesting fact about space for kids",
    "interesting fact about space NASA",
    "interesting fact about space Reddit",
    "interesting fact about space Wikipedia",
    "interesting fact about space 2025",
    "interesting fact about space simple",
    "interesting fact about space advanced",
    "interesting fact about space latest discoveries",
    "interesting fact about space explained",
    "interesting fact about space in short",
    "interesting fact about space real",
    "interesting fact about space true",
    "interesting fact about space mind-blowing",
    "interesting fact about space scary",
    "interesting fact about space cool",
    "interesting fact about space crazy",
    "interesting fact about space bizarre",
    "interesting fact about space rare",
    "interesting fact about space unknown",
    "interesting fact about space daily",
    "interesting fact about space top 10",
    "interesting fact about space top 5",
    "interesting fact about space list",
    "interesting fact about space summary",
    "interesting fact about space article",
    "interesting fact about space blog",
    "interesting fact about space video",
    "interesting fact about space reddit",
    "interesting fact about space quora",
    "interesting fact about space pdf",
    "interesting fact about space easy",
    "NASA space fact today",
    "NASA space fact for kids",
    "NASA space fact Reddit",
    "NASA space fact cool",
    "NASA space fact scary",
    "NASA space fact bizarre",
    "NASA space fact 2025",
    "NASA space fact real",
    "NASA space fact blog",
    "NASA space fact latest discoveries",
    "NASA space fact explained",
    "NASA space fact in short",
    "NASA space fact facts",
    "NASA space fact quora",
    "NASA space fact summary",
    "NASA space fact daily",
    "NASA space fact true",
    "NASA space fact weird",
    "NASA space fact trivia",
    "space facts for kids",
    "space facts from NASA",
    "space facts 2025",
    "space facts blog",
    "space facts in Hindi",
    "space facts short",
    "space facts latest",
    "space facts reddit",
    "space facts about black holes",
    "space facts video",
    "space facts for school",
    "space facts that will blow your mind",
    "space facts in one line",
    "space facts by NASA",
    "space facts 2024",
    "space facts PDF",
    "space facts for presentation",
    "space facts in simple words",
    "space facts article",
    "space facts quiz",
    "Interesting astronomy fact daily",
    "Interesting astronomy fact Wikipedia",
    "Interesting astronomy fact scary",
    "Interesting astronomy fact 2025",
    "Interesting astronomy fact real",
    "Interesting astronomy fact blog",
    "Interesting astronomy fact explained",
    "Interesting astronomy fact summary",
    "Interesting astronomy fact latest",
    "Interesting astronomy fact weird",
    "Interesting astronomy fact for kids",
    "Interesting astronomy fact Reddit",
    "Interesting astronomy fact video",
    "Interesting astronomy fact bizarre",
    "Interesting astronomy fact unknown",
    "Interesting astronomy fact cool",
    "space fact of the day NASA",
    "space fact of the day Wikipedia",
    "space fact of the day real",
    "space fact of the day blog",
    "space fact of the day kids",
    "space fact of the day Reddit",
    "space fact of the day simple",
    "space fact of the day video",
    "space fact of the day 2025",
    "space fact of the day summary",
    "space fact of the day short",
    "space fact of the day explained",
    "space fact of the day article",
    "space fact of the day quora"

    ];

  const query = spaceQueries[Math.floor(Math.random() * spaceQueries.length)];

  const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&key=${process.env.GOOGLE_API_KEY}&cx=${process.env.GOOGLE_CX}`;

  try {
    const res = await axios.get(url);
    const items = res.data.items;

    if (items?.length) {
      const item =
        items.find(i => i.snippet && i.snippet.length > 200) ||
        items.find(i => i.snippet && i.snippet.length > 100) ||
        items[0];

      let fact = item.snippet || item.title;

      // Combine title + snippet if snippet is too short
      if (item.snippet && item.snippet.length < 100 && item.title) {
        fact = `${item.title}. ${item.snippet}`;
      }

      // Format fact: Capitalize first letter and end with proper punctuation
      fact = fact.trim();
      fact = fact.charAt(0).toUpperCase() + fact.slice(1);
      if (!/[.?!]$/.test(fact)) fact += ".";

      return {
        source: "google",
        fact: fact,
        link: item.link,
        description: "Fact auto-extracted from Google CSE. Visit link for full content.",
        Made_by: "Balmukund",
        note: "Its a Free API, you can use it in your projects."
      };
    }

    return null;
  } catch (err) {
    console.error("❌ Google fallback failed:", err.message);
    return null;
  }
}

// 🔄 Auto scrape every 5 minutes
cron.schedule("*/5 * * * *", async () => {
  console.log("🔄 Running scheduled scrape...");
  await scrapeFacts();
});

// 🧪 API: GET /fact
app.get("/fact", async (req, res) => {
  // 1️⃣ Try cache
  const cached = getCachedFact();
  if (cached) return res.json(cached);

  // 2️⃣ Try Google fallback
  const google = await getFactFromGoogle();
  if (google) return res.json(google);

  // 3️⃣ Last resort: Try fresh scrape (in-memory)
  const freshFacts = await scrapeFacts();
  if (freshFacts.length) {
    const random = freshFacts[Math.floor(Math.random() * freshFacts.length)];
    return res.json({ source: "scrape", fact: random });
  }

  // ❌ Nothing worked
  res.status(500).json({
    source: "none",
    error: "Failed to retrieve fact from cache, Google, or scrape."
  });
});

// 🌐 Root Route
app.get("/", (req, res) => {
  res.send("✨ Balmukund's Real Facts API is live!");
});

// 🚀 Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log("📦 Bootstrapping initial data...");
  await scrapeFacts(); // Populate on start
});
