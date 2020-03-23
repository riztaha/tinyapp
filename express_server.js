const bcrypt = require("bcrypt");
const express = require("express");
const morgan = require("morgan");
const cookieSession = require("cookie-session");
const app = express();
const PORT = 8080; // default port 8080
const {
  findUserID,
  urlsForUser,
  generateRandomString,
  loginMatch,
  isEmailDuplicate,
  editURL,
  addURL,
  userIsLoggedIn,
  urlHasHttp
} = require("./helpers");

app.set("view engine", "ejs");

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
  if (userIsLoggedIn) {
    let templateVars = {
      urls: urlsForUser(users[req.session["user_id"]].id, urlDatabase), //Printing out only the urls for logged in user
      user: users[req.session["user_id"]]
    };
    res.render("urls_index", templateVars);
  } else
    res.status(401).render("login", {
      message: "You must be logged in to do that."
    });
});

//Page to create a new short URL
app.get("/urls/new", (req, res) => {
  if (userIsLoggedIn) {
    let templateVars = {
      user: users[req.session["user_id"]]
    };
    res.render("urls_new", templateVars);
  } else
    res.status(401).render("login", {
      message: "You must be logged in to do that."
    });
});

//Page that shows short-long url - with an edit button at bottom
app.get("/urls/:shortURL", (req, res) => {
  if (userIsLoggedIn) {
    let templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      user: users[req.session["user_id"]]
    };
    res.render("urls_show", templateVars);
  } else {
    res.status(401).render("login", {
      message: "You must be logged in to do that."
    });
  }
});

//Form submission to create a shortURL
app.post("/urls", (req, res) => {
  let urlID = "";
  // Updating URL database with a shortURL:longURL pair
  if (userIsLoggedIn) {
    const longURL = req.body["longURL"];
    // For edge-cases with urls that are missing "http://" or that are empty
    if (longURL === "") {
      res.redirect(`/urls/new`);
    }
    if (urlHasHttp(longURL)) {
      urlID = addURL(longURL, users[req.session["user_id"]].id, urlDatabase);
    } else {
      urlID = addURL(
        `http://${longURL}`,
        users[req.session["user_id"]].id,
        urlDatabase
      );
    }
    res.redirect(`/urls/${urlID}`);
  } else {
    res.status(401).render("login", {
      message: "You must be logged in to do that."
    });
  }
});

//Delete a short-long URL entry
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  if (
    userIsLoggedIn &&
    users[req.session["user_id"]].id === urlDatabase[shortURL].userID
  ) {
    delete urlDatabase[shortURL];
    res.redirect("/urls/");
  } else {
    res.status(401).render("login", {
      message: "You must be logged in to do that."
    });
  }
});

//Redirect to the external website (the longURL)
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

// Editing the long URL submit form
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const newLongURL = req.body.newLongURL;
  //If field is blank, keep refreshing page
  //If user that owns the shortURL is logged in then,
  if (newLongURL === "") {
    res.redirect(`/urls/${shortURL}`);
  } else {
    if (
      userIsLoggedIn &&
      users[req.session["user_id"]].id === urlDatabase[shortURL].userID
    ) {
      // Edge-case if new long URL is missing "http://", then add it in and submit the newLongURL.
      if (urlHasHttp(newLongURL)) {
        editURL(
          shortURL,
          newLongURL,
          users[req.session["user_id"]].id,
          urlDatabase
        );
      } else {
        editURL(
          shortURL,
          `http://${newLongURL}`,
          users[req.session["user_id"]].id,
          urlDatabase
        );
      }
      res.redirect("/urls/");
    } else {
      res.status(401).render("login", {
        message: "You do not own that short URL."
      });
    }
  }
});

app.get("/login", (req, res) => {
  res.render("login", { message: null });
});

// User can attempt a login
app.post("/login", (req, res) => {
  let email = req.body.email;
  let pass = req.body.password;
  if (loginMatch(email, pass, users)) {
    //Using helper function if login/pass are in database
    let userID = findUserID(email, users); //Using helper function to identify their userID and set it
    req.session.user_id = userID; //Setting encrypted cookie as the userID
    res.redirect("/urls");
  } else {
    res.status(403).render("login", {
      message: "Wrong email or password."
    });
  }
});

// User can logout from any page
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

//For registering a new email/pass
app.get("/register", (req, res) => {
  let templateVars = { user: users[req.session["user_id"]], message: null };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  if (
    !req.body.email[4] || // If email input doesn't have 5 chars
    !req.body.password[5] || // If password input is less than 6 chars
    isEmailDuplicate(req.body.email, users) // If email exists in system
  ) {
    res.status(400).render("register", {
      message:
        "Bad Email-Password combination. *Passwords must be at least 6 characters long* Email may already exist in database"
    });
  } else {
    const randID = generateRandomString();
    users[randID] = {
      id: randID,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    };
    req.session.user_id = randID;
    res.redirect("/urls");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
