require('dotenv').config();
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import dns from 'dns';
import { url } from 'inspector';
const express = require('express');
const bodyParser = require('body-parser');
const dns = require('dns');
const url = require('url');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));

// Stockage temporaire pour les URLs
const urlDatabase = [];

// Route pour raccourcir l'URL
app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;
  const parsedUrl = new URL(originalUrl);

  if (!parsedUrl.hostname) {
    return res.json({ error: 'invalid url' });
  }

  dns.lookup(parsedUrl.hostname, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }

    const shortUrl = urlDatabase.length + 1;
    urlDatabase.push({ original_url: originalUrl, short_url: shortUrl });
    res.json({ original_url: originalUrl, short_url: shortUrl });
  });
});


// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/shorturl/:short_url', function(_req, res) {
  const shortUrl = parseInt(req.params.short_url, 10);
  const record = urlDatabase.find(entry => entry.short_url === shortUrl);

  if (record) {
    res.redirect(record.original_url);
  } else {
    res.json({ error: 'No short URL found for the given input' });
  }

});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
