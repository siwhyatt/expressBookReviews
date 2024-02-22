const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

//Function to check if the user exists
const doesExist = (username) => {
    for (let user in users) {
        let details = users[user];
        if (details.username === username) {
            return true;
            }
        else {
            return false;
        }
    }
};

public_users.post("/register", (req,res) => {
    const username = req.query.username;
    const password = req.query.password;
  
    if (username && password) {
      if (!doesExist(username)) { 
        users.push({"username":username,"password":password});
        return res.status(200).json({message: "User successfully registred. Now you can login"});
      } else {
        return res.status(404).json({message: "User already exists!"});    
      }
    } 
    return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    // Simulate an asynchronous operation to get the books
    new Promise((resolve, reject) => {
        // Assuming this could be a database call or some IO operation in a real scenario
        if (books) {
            resolve(books);
        } else {
            reject(new Error("Failed to retrieve books"));
        }
    })
    .then(books => {
        res.send(JSON.stringify(books, null, 4));
    })
    .catch(error => {
        // Log the error and send a server error status code
        console.error(error);
        res.status(500).send("An error occurred while retrieving the books.");
    });
});


// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    if (!books[isbn]) {
        return res.status(404).json({message: "Book not found"});        
    }
    else {
        res.send(books[isbn]) 
    }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author;
    
    new Promise((resolve, reject) => {
        if (!books) {
            reject(new Error("Books data is unavailable"));
        } else {
            let filtered_authors = [];
            for (let book in books) {
                let details = books[book];
                if (details.author === author) {
                    filtered_authors.push(details);
                }
            }
            resolve(filtered_authors);
        }
    })
    .then(filtered_authors => {
        if (filtered_authors.length > 0) {
            res.send(filtered_authors);
        }
        else {
            res.send(`No books by ${author} in the database`);
        }
    })
    .catch(error => {
        // Log the error and send a server error status code
        console.error(error);
        res.status(500).send("An error occurred while retrieving the books.");
    });
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title;

    new Promise((resolve,reject) => {
        if (!books) {
            reject(new Error("Books data is unavailable"));
        } else {
            let filtered_title = [];
            for (let book in books) {
            let details = books[book];
            if (details.title === title) {
                filtered_title.push(details);
                }
            }
            resolve(filtered_title);
        }
    })
    .then(filtered_title => {
        if (filtered_title.length > 0) {
            res.send(filtered_title);
        }
        else {
            res.send(`The book ${title} is not in the database`);
        }
    })
    .catch(error => {
        // Log the error and send a server error status code
        console.error(error);
        res.status(500).send("An error occurred while retrieving the books.");
    })
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    if (!books[isbn]) {
        return res.status(404).json({message: "Book not found"});        
    }
    else {
        let book = books[isbn]
        res.send(book.review) 
    }
});

module.exports.general = public_users;
