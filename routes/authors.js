const express = require('express');
const router = express.Router();
const Author = require('../models/author');
const Book = require('../models/book');

// All authors route
router.get('/', async (req, res) => {
    let searchOptions = {};
    if (req.query.name) {
        searchOptions.name = new RegExp(req.query.name, 'i');
    }
    try {
        const authors = await Author.find(searchOptions)
        res.render('authors/index', {
            authors,
            searchOptions: req.query
        });
    } catch (e) {
        res.redirect('/')
    }
})

// New author route
router.get('/new', (req, res) => {
    res.render('authors/new', {author: new Author()})
})

// Create author route
router.post('/', async (req, res) => {
    const author = new Author({
        name: req.body.name
    });
    try {
        const newAuthor = await author.save();
        res.render(`authors/${newAuthor.id}`);
        // res.redirect('authors');
    } catch (e) {
        res.render('authors/new', {
            author: author,
            errorMessage: 'Error creating author'
        })
    }
    // author.save((err, newAuthor) => {
    //     if (err) {
    //         res.render('authors/new', {
    //             author: author,
    //             errorMessage: 'Error creating author'
    //         })
    //     } else {
    //         // res.redirect(`authors/${newAuthor.id}`);
    //         res.redirect('authors');
    //     }
    // })
})

// Show Author By Id Route
router.get('/:id', async (req, res) => {
    try {
        const author = await Author.findById(req.params.id)
        const booksByAuthor = await Book.find({ author: author.id }).limit(6).exec()
        res.render('authors/show', {
            author,
            booksByAuthor
        })
    } catch (e) {
        // console.log(e);
        res.redirect('/');
    }
})

// Edit Author By Id Route
router.get('/:id/edit', async (req, res) => {
    try {
        const author = await Author.findById(req.params.id)
        res.render('authors/edit', { author });
    } catch (e) {
        res.redirect('/authors');
    }
})

// Update Author By Id
router.put('/:id', async (req, res) => {
    let author;
    try {
        author = await Author.findById(req.params.id);
        author.name = req.body.name;
        await author.save();
        res.redirect(`/authors/${author.id}`);
        // res.redirect('authors');
    } catch (e) {
        if (!author) {
            res.redirect('/')
        }
        res.render('/authors/edit', {
            author: author,
            errorMessage: 'Error creating author'
        })
    }
})

// Delete Author By Id
router.delete('/:id', async (req, res) => {
    let author;
    try {
        author = await Author.findById(req.params.id);
        await author.remove();
        res.redirect(`/authors`);
        // res.redirect('authors');
    } catch (e) {
        if (!author) {
            res.redirect('/')
        }
        // console.log(e);
        // res.render(`authors/${author.id}`)
        res.redirect(`/authors/${author.id}`);
    }
})


module.exports = router;