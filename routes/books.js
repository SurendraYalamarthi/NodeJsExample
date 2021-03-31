const express = require('express');
const router = express.Router();
const Book = require('../models/book');
const Author = require('../models/author');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const uploadPath = path.join('public' + Book.coverImageBasePath);

const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif'];
const upload = multer({
    dest: uploadPath,
    fileFilter: (req, file, callback) => {
        // console.log(file);
        callback(null, imageMimeTypes.includes(file.mimetype));
    }
})

// All Books route
router.get('/', async (req, res) => {
    let query = Book.find();
    if (req.query.title) {
        query = query.regex('title', new RegExp(req.query.title, 'i'))
    }
    if (req.query.publishedBefore) {
        query = query.lte('publishDate', req.query.publishedBefore)
    }
    if (req.query.publishedAfter) {
        query = query.gte('publishDate', req.query.publishedAfter)
    }
    try {
        const books = await query.exec();
        res.render('books', {
            books,
            searchOptions: req.query
        })
    } catch (e) {
        res.redirect('/');
    }
})

// New Book route
router.get('/new', async (req, res) => {
    renderNewPage(res, new Book(), false);
})

// Create Book route
router.post('/', upload.single('cover'), async (req, res) => {
    // console.log(JSON.stringify(req.body));
    const fileName = req.file ? req.file.filename : null
    const book = new Book({
        title: req.body.title,
        description: req.body.description,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        coverImageName: fileName,
        author: req.body.author
    });
    console.log(JSON.stringify(book));
    try {
        const newBook = await book.save();
        // res.redirect(`books/${newBook.id}`)
        res.redirect('books')
    } catch (e) {
        // console.log(e);
        if(book.coverImageName) removeBookCoverImage(book.coverImageName)
        renderNewPage(res, book, true);
    }
})

function removeBookCoverImage(fileName) {
    fs.unlink(path.join(uploadPath, fileName), (err) => {
        if(err) console.log(err)
    })
}

async function renderNewPage(res, book, hasError = false) {
    try {
        const authors = await Author.find({});
        let params = {
            authors,
            book
        }
        hasError ? params.errorMessage = 'Error creating book' : null;
        res.render('books/new', params);
    } catch (e) {
        res.redirect('/books');
    }
}


module.exports = router;