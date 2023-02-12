const express = require("express");
const rateLimit = require("express-rate-limit");
const cors = require("cors");

const redisdb = require("./models/redis");
const ShortUrl = require("./models/shortUrl");

const app = express();
const router = express.Router();

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.use(cors());

// Limit requests from same API
const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});
app.use("/api/addShortUrl", limiter);

///////////////////////// Routing //////////////////
app.get("/", async (req, res) => {
  const shortUrls = await ShortUrl.find();
  try {
    res.status(200).json({
      status: "success",
      shortUrls,
    });
    Promise.all(
      shortUrls.map(async (shortUrl) => {
        await redisdb.storeURL(shortUrl);
      })
    );
  } catch (err) {
    console.log(err);
    res.status(400).json({
      status: "error",
    });
  }
});

app.get("/api/:shortUrl", async (req, res) => {
  const id = req.params.shortUrl;

  try {
    let sUrl;
    // sUrl = await redisdb.findURL(JSON.stringify(id));
    // console.log(sUrl);
    if (sUrl == null) sUrl = await ShortUrl.findOne({ short: id });
    if (sUrl == null) return res.sendStatus(404);

    sUrl.clicks++;
    sUrl.save();

    res.redirect(sUrl.full);
  } catch (err) {
    console.log(err);
    res.status(400).json({
      status: "error",
    });
  }
});

app.post("/api/addShortUrl", async (req, res) => {
  const sURL = await ShortUrl.create({ full: req.body.full });

  res.status(200).json({
    status: "success",
    sURL,
  });

  redisdb.storeURL(sURL);
});

app.get("/api/delete/:shortUrl", async (req, res) => {
  const id = req.params.shortUrl;

  try {
    let sUrl = await ShortUrl.findOneAndDelete({ short: id });
    if (sUrl == null) return res.sendStatus(404);

    res.redirect("/");
  } catch (err) {
    console.log(err);
    res.status(400).json({
      status: "error",
    });
  }
});

module.exports = app;
