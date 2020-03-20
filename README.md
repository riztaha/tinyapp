# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

!["screenshot description"](#)
!["screenshot description"](#)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session
- morgan

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.
- Register a new account, or test with 'a@a.com' - '123456'. Secondary account 'b@b.com' - 'qwerty' also available but starts off without any preset URLs 
- Passwords must be at least 6 characters in length. Don't worry, they're hashed and not readable.
- You can create a new short URL at the 'Create New URL' link in the header
- You can edit/delete only the URLs you created. You cannot edit/delete another user's URL
- You cannot create a new short URL unless you are registered/logged in.
- You cannot visit /urls/shortURL unless you are registered/logged in.
- You can share '/u/:shortURL' to redirect anyone to the long URL it is linked with. e.g. http://localhost:8080/u/i3BoGr will redirect people to https://www.google.ca/ 

## Building this app
- Required 4 full days of work. When I mean full, I mean spending 9+ hours/day tinkering, debugging, and hacking away at my laptop screen. This app could have easily been built by copy/pasting codes/scripts from other sources but building it from scratch with whatever knowledge I had resulted in a ton of learning.