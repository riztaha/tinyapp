const { assert } = require("chai");

const {
  findUserID,
  urlsForUser,
  loginMatch,
  isEmailDuplicate
} = require("../helpers.js");

const testUsers = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "$2b$10$hYEThEf5xexMbWQBoR2wH.fqIzp7iE6Ry4ynT.QYtS.u25nMOcfmO"
  }
};

const testUrlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "userRandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "userRandomID" }
};

describe("getUserByEmail (aka findUserID)", function() {
  it("Should return a user with valid email", function() {
    const user = findUserID("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    // Write your assert statement here
    assert.equal(user, expectedOutput);
  });

  it("Should return undefined if the email user does not exist", function() {
    const user = findUserID("UNKNOWN@abc.com", testUsers);
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput);
  });
});

describe("urlsForUser", function() {
  it("Should return the urls associated with the user", function() {
    const user = urlsForUser("userRandomID", testUrlDatabase);
    const expectedOutput = {
      b6UTxQ: { longURL: "https://www.tsn.ca", userID: "userRandomID" },
      i3BoGr: { longURL: "https://www.google.ca", userID: "userRandomID" }
    };
    // // Write your assert statement here
    assert.deepEqual(user, expectedOutput);
  });
});

describe("loginMatch", function() {
  it("Should return true if username/password match in database.", function() {
    const login = loginMatch("user2@example.com", "testpass", testUsers);
    const expectedOutput = true;
    assert.equal(login, expectedOutput);
  });

  it("Should return false if username/password match is not found in database.", function() {
    const login = loginMatch(
      "user2@example.com",
      "INCORRECTPASSWORD",
      testUsers
    );
    const expectedOutput = false;
    assert.equal(login, expectedOutput);
  });
});

describe("isEmailDuplicate", function() {
  it("Should return true if email already exist in database.", function() {
    const email = isEmailDuplicate("user2@example.com", testUsers);
    const expectedOutput = true;
    assert.equal(email, expectedOutput);
  });

  it("Should return false if email does not exist in database.", function() {
    const email = isEmailDuplicate("NewEmail@email.com", testUsers);
    const expectedOutput = false;
    assert.equal(email, expectedOutput);
  });
});
