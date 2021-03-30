const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    console.log('rendering index file')
    res.render('index');
})

module.exports = router;