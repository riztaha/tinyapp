const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.redirect(`/urls/`);
});

//Router listing all short/long urls.
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  let templateVars = { greeting: "Hello World!" };
  res.render("hello_world", templateVars);
});

//Page to create a new URL
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//Site specific for short-long url
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render("urls_show", templateVars);
});

//Form submission to create the shortURL
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body["longURL"]; // Updating URL database with a shortURL:longURL pair
  urlDatabase[shortURL] = `//${longURL}`; // Found a workaround to bypass urls that are missing "http://"
  res.redirect(`/urls/${shortURL}`);
});

//Redirect to the longURL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  console.log(longURL);
  res.redirect(longURL);
  //   const longURL = req.body["longURL"];
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
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
