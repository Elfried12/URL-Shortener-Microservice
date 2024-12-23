require('dotenv').config();
const express = require('express');
const urlparser = require('url');
const dns = require('dns');
const mongoose = require('mongoose');
const {MongoClient} = require('mongodb');
const cors = require('cors');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

const client = new MongoClient(process.env.DB_URL);

const db = client.db("ShortURL");

const urls=db.collection("dexter");


app.use(cors());

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post('/api/shorturl', function(req, res) {
  console.log(req.body)
  const url =req.body.url
  const dnslookup = dns.lookup(urlparser.parse(url).hostname,async(err,address) => {
    if(!address){
    res.json({error: "Invalid URL"})
  }else{
      const urlcount =await urls.countDocuments({})
      const urlDoc ={
        url,
        short_url:urlcount
      }
      const result = await urls.insertOne(urlDoc)
      console.log(result);
      res.json({original_url: url,short_url:urlcount})
  }
  })
});

app.get('/api/shorturl/:short_url',async(req,res)=>{
    const shorturl = req.params.short_url
    const urlDoc = await urls.findOne({short_url: +shorturl})
    res.redirect(urlDoc.url)

})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
