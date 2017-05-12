var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
var cookieParser = require('cookie-parser')
app.use(cookieParser());
app.set("view engine", "ejs")
var cookieSession = require('cookie-session')
var methodOverride = require('method-override')

//override with POST
app.use(methodOverride('_method'));


app.use(cookieSession({
  name: 'session',
  keys: ['2','5','6'],

}))
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const bcrypt = require('bcrypt');

var urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca",
              userID: "userRandomID"},
  "9sm5xK": {longURL: "http://www.google.com",
              userID: "user2RandomID"}
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "a@example.com",
    password: "ab"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "b@example.com",
    password: "dishwasher-funk"
  }
}

// this helper function is to help filtering out links and it will output links that has the property of id,
function urlsForUser(id){
  let result = {};
  for( let short in urlDatabase) {
    if (urlDatabase[short].userID == id){
      result[short] = urlDatabase[short]
    }
  }
  return result
}

// To generate a random string for both the user id and the url link.
function generateRandomString() {
  return Math.random().toString(36).substr(2, 6)
}


// To force the user to go to /urls
app.get('/', (req, res) => {
  res.redirect('/urls');
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/urls", (req, res) => {
  //filter out the links for the specific user.
  let userData = urlsForUser(req.session.user_id);
  let templateVars = { urls: userData,
    user_id : req.session.user_id,
    user: users};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { urls: urlDatabase,
                  user_id : req.session.user_id,
                  user: users};
  if (req.session.user_id){
  res.render("urls_new", templateVars);
} else {
  res.redirect("login");
}
});
// to collect the data from urls_show and add it to the urlDatabase
app.post("/urls", (req, res) => {
  let short = generateRandomString();
  let newObject = {};
  newObject["longURL"] = req.body.longURL;
  newObject["userID"] = req.session.user_id;
  urlDatabase[short]=newObject;
  res.redirect("/urls");
});

// to check the database for longurl and then redirecting it to the actual website.
app.get("/u/:shortURL", (req, res) => {
  let goTo = urlDatabase[req.params.shortURL].longURL;
  res.redirect(goTo);
});
// to delete the e short url completly.
app.post('/urls/:shortURL/delete', (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.shortURL].userID){
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  } else {
    res.sendStatus("400");
  }
});
// This is for editing the URL.
app.get('/urls/:shortURL', (req, res) => {
  let templateVars = { urls: urlDatabase,
                       shortURL: req.params.shortURL,
                     user_id : req.session.user_id,
                     user: users};
  if (req.session.user_id === urlDatabase[req.params.shortURL].userID){
    urlDatabase[req.params.shortURL]["longURL"] = req.body.updateLongURL;;
    res.render("urls_show", templateVars);
  } else {
    res.sendStatus("400")
  }
});
//This is for changing the long url database.
app.post ('/urls/:shortURL/update', (req, res) => {
  urlDatabase[req.params.shortURL]["longURL"] = req.body.updateLongURL;
  res.redirect('/urls');
});
// For login page.
app.get("/login", (req, res) => {
  let templateVars = { urls: urlDatabase,
                       shortURL: req.params.shortURL,
                     user_id : req.session.user_id,
                     user: users};
  res.render("login", templateVars);
})
// To check if the login information is in the database.
app.post('/login', (req, res) => {
  for (let ind in users) {
    if (users[ind].email === req.body.email){
      if (bcrypt.compareSync(req.body.password, users[ind].password)){
        req.session.user_id = users[ind].id
        res.redirect('/urls');
        return;
      } else{
        res.sendStatus("403");
        return;
      }
    }
  }
  res.sendStatus("403");
});
// to logout the page and delete the cookie's session.
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});
// render the register page. 
app.get('/register', (req, res) => {
  let templateVars = { urls: urlDatabase,
                       shortURL: req.params.shortURL,
                     user_id : req.session.user_id,
                     user: users};
  res.render("urls_register", templateVars);
});

app.post('/register', (req, res) => {
  user = {};
  let new_id = generateRandomString();
  let new_email = req.body.email;
  if (new_email === ""){
    res.sendStatus("400");
    return;
  }
  let new_password = req.body.password;
  let hashed_password = bcrypt.hashSync(new_password, 10);
  if(new_password === "") {
    res.sendStatus("400");
    return;
  }
  user["id"] = new_id;
  user["email"] = new_email;
  user["password"] = hashed_password;
  users[new_id] = user;
  req.session.user_id = new_id;
  res.redirect('/urls');
  return;
})
