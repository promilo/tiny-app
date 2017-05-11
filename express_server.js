var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
var cookieParser = require('cookie-parser')
app.set("view engine", "ejs")

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())



var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
  // "shortURL": "longURL"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}


app.get('/', (req, res) => {
  res.redirect('/urls');
})

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
  let templateVars = { urls: urlDatabase,
    username : req.cookies["username"] };
  res.render("urls_index", templateVars);
});

// app.get("/urls/:id", (req, res) => {
//   let templateVars = { shortURL: req.params.id };
//   res.render("urls_show", templateVars);
// });

app.get("/urls/new", (req, res) => {
  let templateVars = { urls: urlDatabase,
                  username : req.cookies["username"] };
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
});

app.get('/urls/:shortURL', (req, res) => {
  let templateVars = { urls: urlDatabase,
                       shortURL: req.params.shortURL,
                     username : req.cookies["username"] };
  urlDatabase[req.params.shortURL] = req.body.updateLongURL;
  res.render("urls_show", templateVars);
});

app.post ('/urls/:shortURL/update', (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.updateLongURL;

  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie("username");
  res.redirect('/urls');
});


app.get('/register', (req, res) => {
  res.render("urls_register");
});

app.post('/register', (req, res) => {
  user = {};
  let new_id = generateRandomString();
  let new_email = req.body.email;
  let new_password = req.body.password;
  user["id"] = new_id;
  user["email"] = new_email;
  user["password"] = new_password;
  users[new_id] = user;
  console.log(users);
  res.cookie('username', new_id)
  res.redirect('/urls');

})
