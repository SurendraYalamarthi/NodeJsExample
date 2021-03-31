const express = require('express');
const router = express.Router();
const Books = require('../models/book');

router.get('/', async (req, res) => {
    // console.log('rendering index file')
    let books;
    try {
        books = await Books.find().sort({createdAt: 'desc'}).limit(10);
        // res.render('index', {books});
    } catch (e) {
        books = [];
    }
    res.render('index', {books});
})

module.exports = router;