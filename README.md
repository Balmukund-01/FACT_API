# FACT_API
🌐 Real Facts API – My First Fully Functional, Self-Built Public API (Free &amp; Live)

---

## 🧾 2. Description

```
I proudly present my first **self-developed**, **public**, and **live** API – the **Real Facts API**!

Built entirely from scratch using **Node.js**, this API fetches real, interesting facts and serves them through a clean Express endpoint.

✨ Features:
- Scrapes 1000+ real facts every 5 minutes from thefactsite.com
- Uses **Google Programmable Search API** as fallback
- Smart fact caching in local `.json` file
- Auto-runs every 5 minutes using `node-cron`
- Free to use — no login, no signup, just hit the endpoint!

🔗 Live API Endpoint:  
**`https://real-facts-api.onrender.com/fact`**

Try it, fork it, or contribute.  
This project taught me scraping, cron jobs, REST APIs, Google API integration, and deployment.

👨‍💻 Tech used:
- Node.js + Express
- Cheerio + Axios for scraping
- Google Programmable Search
- Render for deployment
- JSON for simple caching

Proud of this milestone as a self-taught backend developer.  
#BackendDev #NodeJS #Render #GoogleAPI #PublicAPI #SelfProject #WebScraping
```

---


````md
# 🌐 Real Facts API – Get Real, Random Facts from the Web!

This is a fully working **public API** that fetches real, interesting facts from the internet — updated every 5 minutes and available for free.

---

## 🔥 Live API

**Endpoint:**  
`https://real-facts-api.onrender.com/fact`

**Method:** `GET`  
**Returns:** Random fact from cache, Google API, or fresh scrape.

Example response:
```json
{
  "source": "cache",
  "fact": "Did you know honey never spoils? Archaeologists have found pots of honey in ancient tombs that are over 3000 years old and still perfectly edible."
}
````

---

## 💡 Features

* ✅ Scrapes facts from [thefactsite.com](https://www.thefactsite.com/1000-interesting-facts/)
* 🔁 Auto-updates every 5 minutes with `node-cron`
* 🧠 Caches facts in `facts.json`
* 🌐 Fallback to Google Custom Search API if cache is empty
* 🧩 Clean and simple Express-based REST API
* 🌍 Live deployed on Render

---

## ⚙️ Tech Stack

* Node.js + Express
* Cheerio + Axios (for scraping)
* Google Programmable Search API (fallback)
* Node-Cron
* Render (for deployment)

---

## 📦 Setup Locally

```bash
git clone https://github.com/yourusername/real-facts-api.git
cd real-facts-api
npm install
```

Create a `.env` file with:

```env
GOOGLE_API_KEY=your_google_api_key
GOOGLE_CX=your_custom_search_engine_id
PORT=3000
```

Then run:

```bash
node server.js
```

---

## 📅 Cron Job

The app scrapes fresh facts every 5 minutes and saves them in `facts.json`.

---

## 🤝 Contribute

Pull requests and forks are welcome!
Want to add DB support? translation? hosting improvements? Go for it!

---

## 🧠 Author

Developed by Balmukund Shukla – a self-taught backend and MERN developer from Mumbai 🇮🇳

---

## 📄 License

MIT License
