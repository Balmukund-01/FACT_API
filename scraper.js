// const puppeteer = require("puppeteer");
// const fs = require("fs");

// async function scrapeWikipediaFacts() {
//   const browser = await puppeteer.launch({
//     headless: true,
//     args: ["--no-sandbox", "--disable-setuid-sandbox"]
//   });

//   const page = await browser.newPage();

//   try {
//     await page.goto("https://en.wikipedia.org/wiki/List_of_common_misconceptions", {
//       waitUntil: "domcontentloaded",
//       timeout: 0
//     });

//     await page.waitForSelector(".mw-parser-output", { timeout: 20000 });

//     const facts = await page.$$eval(".mw-parser-output > ul li", (elements) =>
//       elements
//         .map((el) => el.innerText.trim())
//         .filter((text) => text.length > 50 && !text.includes("[edit]"))
//     );

//     fs.writeFileSync("facts.json", JSON.stringify(facts, null, 2));
//     console.log(`✅ Scraped & saved ${facts.length} Wikipedia facts`);
//   } catch (err) {
//     console.error("❌ Scraping failed:", err.message);
//   } finally {
//     await browser.close();
//   }
// }

// if (require.main === module) {
//   scrapeWikipediaFacts();
// }

// module.exports = scrapeWikipediaFacts;








const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

// Wikipedia pages list (excluding "List_of_common_misconceptions" because it will be handled separately)
const wikiPages = [
  "fun_facts",
  "did_you_know",
  "mind_blown",
  "fact_of_the_day",
  "random_trivia",
  "amazing_facts",
  "unbelievable_but_true",
  "quirky_facts",
  "cool_facts",
  "wow_facts",
  "jaw_dropping_facts",
  "funny_facts",
  "strange_but_true",
  "daily_wtf_facts",
  "facts_that_sound_fake_but_are_true",
  "just_fun_facts",
  "little_known_facts",
  "facts_to_share",
  "true_and_bizarre",
  "interesting_everyday_facts",
  "List_of_common_misconceptions",
  "Unusual_articles",
  "List_of_common_falsehoods",
  "List_of_urban_legends",
  "List_of_misconceptions_about_language",
  "List_of_unusual_deaths",
  "List_of_historical_myths",
  "List_of_conspiracy_theories",
  "List_of_misconceptions_about_the_human_body",
  "List_of_scientific_misconceptions",
  "List_of_food_and_drink_misconceptions",
  "List_of_animals_with_fraudulent_names",
  "List_of_common_misconceptions_in_history",
  "List_of_common_misconceptions_in_science",
  "Bizarre_delusions",
  "Strange_phenomena",
  "Weird_Wikipedia_articles",
  "Pseudoscience",
  "Paranormal",
  "Urban_legend"
];

async function scrapeWikipediaFacts() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    executablePath: puppeteer.executablePath()
    // executablePath: '/usr/bin/google-chrome'  // Usually default path on Linux Render
  });

  const page = await browser.newPage();
  let allNewFacts = [];

  // Read existing facts
  let existingFacts = [];
  try {
    const data = fs.readFileSync("facts.json", "utf-8");
    existingFacts = JSON.parse(data);
  } catch {
    existingFacts = [];
  }

  // 🔹 Step 1: Scrape List_of_common_misconceptions
  try {
    const misconceptionsURL = "https://en.wikipedia.org/wiki/List_of_common_misconceptions";
    console.log(`🌐 Scraping from: ${misconceptionsURL}`);
    await page.goto(misconceptionsURL, { waitUntil: "domcontentloaded", timeout: 0 });

    await page.waitForSelector(".mw-parser-output", { timeout: 20000 });

    const misconceptionsFacts = await page.$$eval(".mw-parser-output > ul li", elements =>
      elements
        .map(el => el.innerText.trim())
        .filter(text => text.length > 50 && !text.includes("[edit]"))
    );

    const uniqueMisconceptions = misconceptionsFacts.filter(
      fact => !existingFacts.includes(fact) && !allNewFacts.includes(fact)
    );

    if (uniqueMisconceptions.length > 0) {
      allNewFacts.push(...uniqueMisconceptions);
      console.log(`✅ Added ${uniqueMisconceptions.length} facts from "List_of_common_misconceptions"`);
    } else {
      console.log("⚠️ No new unique facts found in misconceptions list");
    }
  } catch (err) {
    console.error("❌ Failed to scrape List_of_common_misconceptions:", err.message);
  }

  // 🔹 Step 2: Scrape from all other pages
  for (let urlSlug of wikiPages) {
    const fullURL = `https://en.wikipedia.org/wiki/${urlSlug}`;
    console.log(`🌐 Scraping from: ${fullURL}`);

    try {
      await page.goto(fullURL, { waitUntil: "domcontentloaded", timeout: 0 });

      // ✅ Check for invalid titles
      const pageTitle = await page.title();
      if (
        pageTitle.toLowerCase().includes("does not exist") ||
        pageTitle.toLowerCase().includes("search results")
      ) {
        console.log(`⚠️ Skipping "${urlSlug}" — not a valid article`);
        continue;
      }

      const facts = await page.$$eval(".mw-parser-output li, .mw-parser-output p", elements =>
        elements
          .map(el => el.innerText.trim())
          .filter(text => {
            const lower = text.toLowerCase();
            return (
              text.length > 50 &&
              !text.includes("[edit]") &&
              !lower.includes("search for") &&
              !lower.includes("look for") &&
              !lower.includes("check the deletion log") &&
              !lower.includes("you need to log in") &&
              !lower.includes("this page is protected") &&
              !lower.includes("redirect here") &&
              !lower.includes("disambiguation") &&
              !lower.includes("may refer to")
            );
          })
      );

      const uniqueNewFacts = facts.filter(
        fact => !existingFacts.includes(fact) && !allNewFacts.includes(fact)
      );

      if (uniqueNewFacts.length > 0) {
        allNewFacts.push(...uniqueNewFacts);
        console.log(`✅ Appended ${uniqueNewFacts.length} facts from "${urlSlug}". Total facts: ${existingFacts.length + allNewFacts.length}`);
      } else {
        console.log(`⚠️ No new unique facts found in "${urlSlug}"`);
      }

    } catch (err) {
      console.error(`❌ Failed to scrape ${urlSlug}:`, err.message);
    }
  }

  // 🔹 Final Save
  const finalFacts = [...existingFacts, ...allNewFacts];
  fs.writeFileSync("facts.json", JSON.stringify(finalFacts, null, 2));
  console.log(`📦 Total stored facts: ${finalFacts.length}`);

  await browser.close();
  return finalFacts;
}

if (require.main === module) {
  scrapeWikipediaFacts();
}

module.exports = scrapeWikipediaFacts;
