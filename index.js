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

    const url = `https://www.tradera.com/search?q=${encodeURIComponent(query)}`;

    await page.goto(url, { waitUntil: "domcontentloaded" });
    await new Promise(r => setTimeout(r, 3000));

    const results = await page.evaluate(() => {
      const items = [];
      const links = Array.from(document.querySelectorAll("a"));

      links.forEach(el => {
        const title = el.innerText;
        const url = el.href;

        if (
          title &&
          url &&
          title.length > 20 &&
          title.toLowerCase().includes("iphone") &&
          url.includes("/item/")
        ) {
          items.push({ title, url });
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
