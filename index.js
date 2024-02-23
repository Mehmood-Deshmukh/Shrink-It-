const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
require('dotenv').config();
const path = require("path")
const app = express();
const link = require('./models/link');

const port = process.env.PORT || 3000;


mongoose.connect(process.env.mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({ mongoUrl: process.env.mongoUrl }),
});

app.use(sessionMiddleware);

app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + "/public"));

generateShortId = () => {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

const linkSchema = new mongoose.Schema({
  full: {
    type: String,
    required: true,
  },
  tiny: {
    type: String,
    required: true,
    default: () => generateShortId(),
  },
  clicks: {
    type: Number,
    required: true,
    default: 0,
  },
  session: {
    type: String,
    required: true,
  },
});

const Link = mongoose.model('Link', linkSchema);


app.post('/Shrink', async (req, res) => {
  console.log("post")
  const sessionId = req.session.id;
  console.log(sessionId);
  try {
    await Link.create({
      full: req.body.FullURL,
      session: sessionId,
    });

    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


app.get('/', async (req, res) => {
  const sessionId = req.session.id;

  try {
 
    const sessionExists = await Link.exists({ session: sessionId });
    console.log(sessionExists);
    if (sessionExists) {
      const shrinks = await Link.find({ session: sessionId });
      res.render('index.ejs', { Shrinks: shrinks });
    } else {

      res.render('index.ejs', { Shrinks: [] }); 
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
// app.get("/", (req, res) => {
//   res.render('index.ejs', { Shrinks: [] }); 
// });


app.get('/:Shrink', async (req, res) => {
  const turl = await Link.findOne({ tiny: req.params.Shrink });
  if (turl == null) {
    return res.sendStatus(404);
  }

  turl.clicks++;
  turl.save();

  res.redirect(turl.full);
});


app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
