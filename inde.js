const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/search", async (req, res) => {
  const query = req.query.q || "iphone";

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();

    await page.goto(`https://www.tradera.com/search?q=${query}`, {
      waitUntil: "networkidle2"
    });

    await new Promise(r => setTimeout(r, 5000));

    const results = await page.evaluate(() => {
      const items = [];

      document.querySelectorAll("img").forEach(img => {
        const src = img.src;

        // 🔥 FILTRERA BORT SKRÄP
        if (src.includes("img.tradera.net")) {
          items.push({
            id: src,
            title: "Tradera item",
            image: src,
            url: "https://www.tradera.com",
            source: "tradera"
          });
        }
      });

      return items.slice(0, 20);
    });

    await browser.close();

    res.json(results);

  } catch (error) {
    console.error(error);
    res.json({ error: "Something went wrong" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
