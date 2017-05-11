var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
var cookieParser = require('cookie-parser')
app.set("view engine", "ejs")

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())

const bcrypt = require('bcrypt');

var urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca",
              userID: "userRandomID"},
  "9sm5xK": {longURL: "http://www.google.com",
              userID: "user2RandomID"}
  // "shortURL": "longURL"
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
  let userData = urlsForUser(req.cookies["username"]);
  let templateVars = { urls: userData,
    user_id : req.cookies["username"],
    user: users};
  res.render("urls_index", templateVars);
});

// app.get("/urls/:id", (req, res) => {
//   let templateVars = { shortURL: req.params.id };
//   res.render("urls_show", templateVars);
// });

app.get("/urls/new", (req, res) => {
  let templateVars = { urls: urlDatabase,
                  user_id : req.cookies["username"],
                  user: users};
  if (req.cookies["username"]){
  res.render("urls_new", templateVars);
} else {
  res.redirect("login");
}
});



app.post("/urls", (req, res) => {
  let short = generateRandomString();
  let newObject = {};
  newObject["longURL"] = req.body.longURL;
  newObject["userID"] = req.cookies["username"];
  urlDatabase[short]=newObject;
  console.log(urlDatabase[short]);
  res.redirect("/urls");
});



function generateRandomString() {
  return Math.random().toString(36).substr(2, 6)
}

function urlsForUser(id){
  let result = {};
  for( let short in urlDatabase) {
    if (urlDatabase[short].userID == id){
      result[short] = urlDatabase[short]
    }
  }
  return result
}

app.get("/u/:shortURL", (req, res) => {
  let goTo = urlDatabase[req.params.shortURL]["longURL"];
  console.log(goTo);
  res.redirect(goTo);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  if (req.cookies["username"] === urlDatabase[req.params.shortURL].userID){
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  } else {
    res.sendStatus("400");
  }
});

app.get('/urls/:shortURL', (req, res) => {
  let templateVars = { urls: urlDatabase,
                       shortURL: req.params.shortURL,
                     user_id : req.cookies["username"],
                     user: users};
  if (req.cookies["username"] === urlDatabase[req.params.shortURL].userID){
    urlDatabase[req.params.shortURL]["longURL"] = req.body.updateLongURL;;
    res.render("urls_show", templateVars);
  } else {
    res.sendStatus("400")
  }
});

app.post ('/urls/:shortURL/update', (req, res) => {
  urlDatabase[req.params.shortURL]["longURL"] = req.body.updateLongURL;

  res.redirect('/urls');
});

app.get("/login", (req, res) => {
  let templateVars = { urls: urlDatabase,
                       shortURL: req.params.shortURL,
                     user_id : req.cookies["username"],
                     user: users};
  res.render("login", templateVars);

})

app.post('/login', (req, res) => {
  console.log("app.post /login");
  console.log(users);
  for (let ind in users) {
    console.log("Checking " + users[ind].email);
    if (users[ind].email === req.body.email){
      console.log("Checked and its right " + users[ind].email)
      if (bcrypt.compareSync(req.body.password, users[ind].password)){
        res.cookie('username', users[ind].id)
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

app.post('/logout', (req, res) => {
  res.clearCookie("username");
  res.redirect('/urls');
});


app.get('/register', (req, res) => {
  let templateVars = { urls: urlDatabase,
                       shortURL: req.params.shortURL,
                     user_id : req.cookies["username"],
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
  console.log("app.post /register ");
  console.log(users)
  res.cookie('username', new_id)
  res.redirect('/urls');
  return;
})
