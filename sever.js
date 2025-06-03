// server.js
const express = require('express');
const cron = require('node-cron');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

let tasks = [];

app.post('/monitor', (req, res) => {
  const { url, interval } = req.body;
  if (!url) return res.status(400).send("URL is required");

  // Convert interval to cron format
  const cronTime = getCronTime(interval);
  if (!cronTime) return res.status(400).send("Invalid interval");

  const task = cron.schedule(cronTime, async () => {
    try {
      const response = await fetch(url);
      console.log(`✅ Pinged ${url}: ${response.status}`);
    } catch (err) {
      console.log(`❌ Error pinging ${url}: ${err.message}`);
    }
  });

  tasks.push({ url, interval, task });
  res.send("Monitoring started for " + url);
});

function getCronTime(interval) {
  switch (interval) {
    case '1min': return '* * * * *';
    case '5min': return '*/5 * * * *';
    case '10min': return '*/10 * * * *';
    case '24h': return '0 0 * * *';
    default: return null;
  }
}

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
