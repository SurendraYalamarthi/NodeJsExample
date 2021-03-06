
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config({path:'./.env'});
}

const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const app = express();

const bodyParser = require('body-parser');
const methodOverride = require('method-override'); // To use put and delete from browser

const indexRouter = require('./routes/index');
const authorsRouter = require('./routes/authors');
const booksRouter = require('./routes/books');

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.set('layout', 'layouts/layout');
app.use(expressLayouts);
app.use(methodOverride('_method')); // To use put and delete from browser
app.use(express.static('public'));
app.use(bodyParser.urlencoded({limit: '10mb', extended: false}));

const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', error => { console.log(error); })
db.once('open', () => { console.log('connected to mongoose'); })

app.use('/', indexRouter);
app.use('/authors', authorsRouter);
app.use('/books', booksRouter);

app.listen(process.env.PORT || 3000);
