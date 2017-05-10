var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080

app.set("view engine", "ejs")

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));



var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
  // "shortURL": "longURL"
};

// app.get("/", (req, res) => {
//   res.end("Hello!");
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});



app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// app.get("/urls/:id", (req, res) => {
//   let templateVars = { shortURL: req.params.id };
//   res.render("urls_show", templateVars);
// });

app.get("/urls/new", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_new", templateVars);
});



app.post("/urls", (req, res) => {
  let short = generateRandomString();
  urlDatabase[short] = req.body.longURL;
  console.log(urlDatabase[short]);
  res.redirect("/urls");
});


function generateRandomString() {
  return Math.random().toString(36).substr(2, 6)
}

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL]
  console.log(longURL);
  res.redirect(longURL);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
})

app.get('/urls/:shortURL', (req, res) => {
  let templateVars = { urls: urlDatabase,
                       shortURL: req.params.shortURL};
  urlDatabase[req.params.shortURL] = req.body.updateLongURL;
  res.render("urls_show", templateVars);
})

app.post ('/urls/:shortURL/update', (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.updateLongURL;

  res.redirect('/urls');
})
