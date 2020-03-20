const bcrypt = require("bcrypt");

//Function to find matching UserID by email.
const findUserID = function(email, users) {
  for (let key in users) {
    if (email === users[key].email) {
      return users[key].id;
    }
  }
  return undefined;
};

//Function to find matching URLs for specific UserID
const urlsForUser = function(id, urlDatabase) {
  let matchingURLS = {};
  for (let key in urlDatabase) {
    if (id === urlDatabase[key].userID) {
      matchingURLS[key] = urlDatabase[key];
    }
  }
  return matchingURLS;
};

//Function to match the password to the email provided:
const loginMatch = function(email, pass, users) {
  for (let key in users) {
    if (
      email === users[key].email &&
      bcrypt.compareSync(pass, users[key].password)
    ) {
      return true;
    }
  }
  return false;
};

//Function to find if a duplicate email already exists in the system
const isEmailDuplicate = function(email, users) {
  for (let key in users) {
    if (email === users[key].email) {
      return true;
    }
  }
  return false;
};

//Function to generate random string
const generateRandomString = function() {
  let str = "";
  const alpha =
    "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let i = 0; i < 6; i++) {
    str += alpha.charAt(Math.floor(Math.random() * alpha.length));
  }
  return str;
};

//Helper function when adding a URL to database
const addURL = function(longUrl, userId, urlDatabase) {
  const id = generateRandomString();
  urlDatabase[id] = {
    longURL: longUrl,
    userID: userId
  };
  return id;
};

//Helper function when editing a URL
const editURL = function(id, longUrl, userId, urlDatabase) {
  urlDatabase[id] = {
    longURL: longUrl,
    userID: userId
  };
};

module.exports = {
  findUserID,
  urlsForUser,
  generateRandomString,
  loginMatch,
  isEmailDuplicate,
  addURL,
  editURL
};
