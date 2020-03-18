const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
// const { users } = require("./users");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cookieParser());

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

app.get("/", (req, res) => {
  res.redirect("/urls/");
});

//Index listing all short/long urls.
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_index", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//Page to create a new short URL
app.get("/urls/new", (req, res) => {
  let templateVars = { username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});

//Site specific to show short-long url
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"]
  };
  res.render("urls_show", templateVars);
});

//Form submission to create the shortURL
app.post("/urls", (req, res) => {
  // Updating URL database with a shortURL:longURL pair
  const shortURL = generateRandomString();
  const longURL = req.body["longURL"];
  // For edge-cases with urls that are missing "http://" or that are empty
  if (longURL[0] === "h" || longURL[6] === "/") {
    urlDatabase[shortURL] = longURL;
  } else if (longURL === "") {
    res.redirect(`/urls/new`);
  } else {
    urlDatabase[shortURL] = `http://${longURL}`;
  }
  //   if (res.redirect(longURL) === res.status(404)) {  // Tried implementing edge-case of bad longURL
  //     console.log("This site does not exist");
  //   }
  res.redirect(`/urls/${shortURL}`);
});

//Delete function
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls/");
});

//Redirect to the longURL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

// Post for NEW LONG URL submit form
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const newLongURL = req.body.newLongURL;
  // Edge-cases if new long URL is missing "http://" or is blank
  if (newLongURL[0] === "h" || newLongURL[6] === "/") {
    urlDatabase[id] = newLongURL;
  } else if (newLongURL === "") {
    res.redirect(`/urls/${id}`);
  } else {
    urlDatabase[id] = newLongURL;
  }
  res.redirect("/urls/");
});

app.post("/login", (req, res) => {
  let username = "";
  if (req.body.username) {
    username = req.body.username;
  }
  res.cookie("username", username);
  res.redirect("/urls/");
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls/");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  const randID = generateRandomString();
  users[randID] = {
    id: randID,
    email: req.body.email,
    password: req.body.password
  };
  console.log(users);
  res.redirect("/urls");
});

//Function to generate random 6-digit alpha key:
function generateRandomString() {
  let str = "";
  const alpha =
    "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let i = 0; i < 6; i++) {
    str += alpha.charAt(Math.floor(Math.random() * alpha.length));
  }
  return str;
}
