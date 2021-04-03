const express = require('express');
const router = express.Router();
const Book = require('../models/book');
const Author = require('../models/author');
// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');
// const uploadPath = path.join('public' + Book.coverImageBasePath);

const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif'];
// const upload = multer({
//     dest: uploadPath,
//     fileFilter: (req, file, callback) => {
//         // console.log(file);
//         callback(null, imageMimeTypes.includes(file.mimetype));
//     }
// })

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
router.post('/', async (req, res) => {
    // console.log(JSON.stringify(req.body));
    // const fileName = req.file ? req.file.filename : null
    let book = new Book({
        title: req.body.title,
        description: req.body.description,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        // coverImageName: fileName,
        author: req.body.author
    });
    try {
        saveCover(book, req.body.cover)
        // console.log(JSON.stringify(book));
        const newBook = await book.save();
        res.redirect(`/books/${newBook.id}`);
    } catch (e) {
        // console.log(e);
        // if(book.coverImageName) removeBookCoverImage(book.coverImageName)
        renderNewPage(res, book, true);
    }
})

// Show Book By Id route
router.get('/:id', async (req, res) => {
    try {
        // console.log('Show Book By Id Route:::' + req.params.id);
        const book = await Book.findById(req.params.id)
            .populate('author')
            .exec();
        res.render('books/show', { book });
    } catch (e) {
        // console.log(e);
        res.redirect('/');
    }
});

// Edit Book route
router.get('/:id/edit', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        renderEditPage(res, book);
    } catch (e) {
        res.redirect('/');
    }
});

// Update Book route
router.put('/:id', async (req, res) => {
    let book;
    try {
        book  = await Book.findById(req.params.id);
        book.title = req.body.title;
        book.description = req.body.description;
        book.publishDate = new Date(req.body.publishDate);
        book.pageCount = req.body.pageCount;
        book.author = req.body.author;
        if (req.body.cover) saveCover(book, req.body.cover);
        await book.save();
        res.redirect(`/books/${book.id}`);
    } catch (e) {
        if (book) {
            renderEditPage(res, book, true);
        } else {
            res.redirect('/')
        }
    }
})

// Delete book route
router.delete('/:id', async (req, res) => {
    let book;
    try {
        book = await Book.findById(req.params.id);
        book.remove();
        res.redirect('/books')
    } catch (e) {
        if (book) {
            res.render('/books/show', { 
                book,
                errorMessage: 'Could not remove book'
            })
        } else {
            res.redirect('/');
        }
    }
})

// function removeBookCoverImage(fileName) {
//     fs.unlink(path.join(uploadPath, fileName), (err) => {
//         if(err) console.log(err)
//     })
// }

async function renderNewPage(res, book, hasError = false) {
    try {
        renderFormPage(res, book, 'new', hasError);
    } catch (e) {
        res.redirect('/books');
    }
}

async function renderEditPage(res, book, hasError = false) {
    try {
        renderFormPage(res, book, 'edit', hasError);
    } catch (e) {
        res.redirect('/books');
    }
}

async function renderFormPage(res, book, form, hasError = false) {
    try {
        const authors = await Author.find({});
        let params = {
            authors,
            book
        }
        hasError ? params.errorMessage = `Error ${form === 'edit' ? 'updatig' : 'creating'} book` : null;
        res.render(`books/${form}`, params);
    } catch (e) {
        res.redirect('/books');
    }
}


function saveCover(book, coverEncoded) {
    if (!coverEncoded) return;
    const cover = JSON.parse(coverEncoded);
    if (cover && imageMimeTypes.includes(cover.type)) {
        book.coverImage = new Buffer.from(cover.data, 'base64');
        book.coverImageType = cover.type;
    }
}

module.exports = router;