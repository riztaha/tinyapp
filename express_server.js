const createError = require("http-errors");
const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; // default port 8080
// const fs = require("fs");
// const { users } = require("./users"); //Tried storing user data in external file.
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
  if (users[req.cookies["user_id"]]) {
    let templateVars = {
      urls: urlDatabase,
      user: users[req.cookies["user_id"]]
    };
    res.render("urls_index", templateVars);
  } else res.redirect("/login");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//Page to create a new short URL
app.get("/urls/new", (req, res) => {
  if (users[req.cookies["user_id"]]) {
    let templateVars = {
      user: users[req.cookies["user_id"]]
    };
    res.render("urls_new", templateVars);
  } else res.redirect("/login");
});

//Site specific to show short-long url
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars);
});

//Form submission to create the shortURL
app.post("/urls", (req, res) => {
  // Updating URL database with a shortURL:longURL pair
  if (users[req.cookies["user_id"]]) {
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
    res.redirect(`/urls/${shortURL}`);
  } else res.redirect("/login");
});

//Delete URL function
app.post("/urls/:shortURL/delete", (req, res) => {
  if (users[req.cookies["user_id"]]) {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect("/urls/");
  } else res.redirect("/login");
});

//Redirect to the longURL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

// Post for NEW LONG URL submit form
app.post("/urls/:id", (req, res) => {
  if (users[req.cookies["user_id"]]) {
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
  } else res.redirect("/login");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  let email = req.body.email;
  let pass = req.body.password;
  if (emailMatch(email, pass)) {
    let userID = findUserID(email); //Using the functions @ bottom of page
    res.cookie("user_id", userID);
    res.redirect("/urls");
  } else {
    res.status(403).send("Error 403: Incorrect email/password");
    // res.render("error", 403);
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls/");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//For the registration page
app.get("/register", (req, res) => {
  let templateVars = { user: users[req.cookies["user_id"]] };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  if (
    !req.body.email[4] || // If email input doesn't have 5 chars
    !req.body.password[5] || // If password input is less than 6 chars
    emailMatch(req.body.email, null) // If email exists in system
  ) {
    res.status(400).redirect("error");
  } else {
    const randID = generateRandomString();
    users[randID] = {
      id: randID,
      email: req.body.email,
      password: req.body.password
    };
    res.cookie("user_id", randID);
    // fs.appendFile(
    //   "users.js",
    //   `{users[${randID}] = {id: ${randID}, email: ${req.body.email}, password: ${req.body.password}
    // };`
    // );
    console.log(users);
    res.redirect("/urls");
  }
});

// catch 400 and forward to error handler
app.use(function(req, res, next) {
  next(createError(400));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500 || 400);
  res.render("error");
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

//Function to lookup email/pass in database:
function emailMatch(email, pass) {
  for (let keys in users) {
    if (email === users[keys].email && pass === users[keys].password) {
      return true;
    }
    if (email === users[keys].email) {
      return true;
    }
  }
  return false;
}

//Function to find matching UserID by email.
function findUserID(email) {
  for (let keys in users) {
    if (email === users[keys].email) {
      return users[keys].id;
    }
  }
  return false;
}
