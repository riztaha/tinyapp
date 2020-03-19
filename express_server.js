const bcrypt = require("bcrypt");
const createError = require("http-errors");
const express = require("express");
const morgan = require("morgan");
const cookieSession = require("cookie-session");
const app = express();
const PORT = 8080; // default port 8080
// const fs = require("fs");
// const { users } = require("./users"); //Tried storing user data in external file.
app.set("view engine", "ejs");

//Need help with settimeout to go to error page and back to main page
//Need help.. How do I make the urls on the index hyperlinks? <a href=????
//Need help fixing layout of buttons
//Need help changing location of databases

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"]
  })
);

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

const users = {
  aJ48lW: {
    id: "aJ48lW",
    email: "a@a.com",
    password: "$2b$10$QcH8TGZZUwrGaS.Jwbif3.BJLbpR7atDwksgVfwrLrSNKhvGi8owC" //123456
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "b@b.com",
    password: "$2b$10$N5zzFnclxHFtOzYmb.N0fuDS.qccTK0h6217jFa1fwcQpnMKhSlZO" // qwerty
  }
};

app.get("/", (req, res) => {
  res.redirect("/urls/");
});

//Index listing all short/long urls.
app.get("/urls", (req, res) => {
  if (users[req.session["user_id"]]) {
    let templateVars = {
      urls: urlsForUser(users[req.session["user_id"]].id), //Printing out only the urls for logged in user
      user: users[req.session["user_id"]]
    };
    res.render("urls_index", templateVars);
  } else res.redirect("/login");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/users.json", (req, res) => {
  res.json(users);
});

//Page to create a new short URL
app.get("/urls/new", (req, res) => {
  if (users[req.session["user_id"]]) {
    let templateVars = {
      user: users[req.session["user_id"]]
    };
    res.render("urls_new", templateVars);
  } else res.redirect("/login");
});

//Site specific to show short-long url
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.session["user_id"]]
  };
  res.render("urls_show", templateVars);
});

//Form submission to create the shortURL
app.post("/urls", (req, res) => {
  let urlID = "";
  // Updating URL database with a shortURL:longURL pair
  if (users[req.session["user_id"]]) {
    const longURL = req.body["longURL"];
    // For edge-cases with urls that are missing "http://" or that are empty
    if (longURL === "") {
      res.redirect(`/urls/new`);
    }
    if (longURL[0] === "h" || longURL[6] === "/") {
      urlID = addURL(longURL, users[req.session["user_id"]].id);
    } else {
      urlID = addURL(`http://${longURL}`, users[req.session["user_id"]].id);
    }
    res.redirect(`/urls/${urlID}`);
  } else res.redirect("/login");
});

//Delete URL function
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  if (
    users[req.session["user_id"]] &&
    users[req.session["user_id"]].id === urlDatabase[shortURL].userID
  ) {
    delete urlDatabase[shortURL];
    res.redirect("/urls/");
  } else res.send(404).redirect("/login");
});

//Redirect to the website at longURL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

function addURL(longUrl, userId) {
  const id = generateRandomString();
  urlDatabase[id] = {
    longURL: longUrl,
    userID: userId
  };
  return id;
}

function editURL(id, longUrl, userId) {
  urlDatabase[id] = {
    longURL: longUrl,
    userID: userId
  };
}

// Post for EDITING LONG URL submit form
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const newLongURL = req.body.newLongURL;
  if (newLongURL === "") {
    res.redirect(`/urls/${shortURL}`);
  }
  if (
    users[req.session["user_id"]] &&
    users[req.session["user_id"]].id === urlDatabase[shortURL].userID
  ) {
    // Edge-cases if new long URL is missing "http://" or is blank
    if (newLongURL[0] === "h" || newLongURL[6] === "/") {
      editURL(shortURL, newLongURL, users[req.session["user_id"]].id);
    } else {
      editURL(
        shortURL,
        `http://${newLongURL}`,
        users[req.session["user_id"]].id
      );
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
  if (loginMatch(email, pass)) {
    let userID = findUserID(email); //Using the functions @ bottom of page
    req.session.user_id = userID;
    res.redirect("/urls");
  } else {
    res.status(403).send("Error 403: Incorrect email/password");
    // res.render("error", 403);
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls/");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//For the registration page
app.get("/register", (req, res) => {
  let templateVars = { user: users[req.session["user_id"]] };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  if (
    !req.body.email[4] || // If email input doesn't have 5 chars
    !req.body.password[5] || // If password input is less than 6 chars
    isEmailDuplicate(req.body.email) // If email exists in system
  ) {
    res.status(400).redirect("error");
  } else {
    const randID = generateRandomString();
    users[randID] = {
      id: randID,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    };
    req.session.user_id = randID;
    // fs.appendFile(
    //   "users.js",
    //   `{users[${randID}] = {id: ${randID}, email: ${req.body.email}, password: ${req.body.password}
    // };`
    // );
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

function isEmailDuplicate(email) {
  for (let key in users) {
    if (email === users[key].email) {
      return true;
    }
  }
  return false;
}

//Function to match the password to the email provided:
function loginMatch(email, pass) {
  for (let key in users) {
    if (
      email === users[key].email &&
      bcrypt.compareSync(pass, users[key].password)
    ) {
      return true;
    }
  }
  return false;
}

//Function to find matching UserID by email.
function findUserID(email) {
  for (let key in users) {
    if (email === users[key].email) {
      return users[key].id;
    }
  }
  return false;
}

//Function to find matching URLs for specific UserID
function urlsForUser(id) {
  let matchingURLS = {};
  for (let key in urlDatabase) {
    if (id === urlDatabase[key].userID) {
      matchingURLS[key] = urlDatabase[key];
    }
  }
  return matchingURLS;
}
