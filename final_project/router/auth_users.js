const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    for (let user in users) {
        let details = users[user];
        if (details.username === username) {
            return true;
            }
        else {
            return false;
        }
    }
}
    
const authenticatedUser = (username,password)=>{ 
    let validusers = users.filter((user)=>{
        return (user.username === username && user.password === password)
      });
      if(validusers.length > 0){
        return true;
      } else {
        return false;
      }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.query.username;
    const password = req.query.password;
  
    if (!username || !password) {
        return res.status(404).json({message: "Error logging in"});
    }
  
    if (authenticatedUser(username,password)) {
      let accessToken = jwt.sign({
        data: password
      }, 'access', { expiresIn: 60 * 60 });
  
      req.session.authorization = {
        accessToken,username
    }
    return res.status(200).send("User successfully logged in");
    } else {
      return res.status(208).json({message: "Invalid Login. Check username and password"});
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;
  const review_text = req.query.review;
  console.log(review_text);
  if (!books[isbn]) {
      return res.status(404).json({message: "Book not found"});        
  }
  else {
      let book = books[isbn];
      if (!book.reviews) {
          book.reviews = {};
      }
      book.reviews[username] = {"review": review_text};
      return res.status(200).json(book);
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username; // Assuming the username is stored in the session

  // Check if the book exists
  if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
  } else {
      let book = books[isbn];
      // Check if there's a review by the user
      if (book.reviews && book.reviews[username]) {
          // Delete the review
          delete book.reviews[username];
          return res.status(200).json({ message: "Review deleted successfully" });
      } else {
          // Review by the user not found
          return res.status(404).json({ message: "Review not found" });
      }
  }
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
