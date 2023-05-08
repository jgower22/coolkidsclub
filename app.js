const express = require('express');
const morgan = require('morgan');
const mainRoutes = require('./routes/mainRoutes');
const userRoutes = require('./routes/userRoutes');
const programRoutes = require('./routes/programRoutes');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const dotenv = require('dotenv');
const eventReminders = require('./scheduledFunctions/eventReminders');
const path = require('path');

//create app
const app = express();

//configure app
let port = process.env.PORT || 8084;
//Allows access from anywhere
let host = '0.0.0.0';
dotenv.config();
let url = `${process.env.DB_URL}`;
app.set('view engine', 'ejs');
mongoose.set('strictQuery', true);

//connect to MongoDB
mongoose.connect(url)
.then(() => {
    //start the server
    app.listen(port, host, ()=>{
        console.log('Server is running on port', port);
    });
})
.catch(err=>console.log(err.message));

//mount middleware
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));
app.use(morgan('tiny'));
app.use(methodOverride('_method'));


//Session
app.use(session({
    secret: `${process.env.SESSION_KEY}`,
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 60 * 60 * 1000}, //1 hour
    store: new MongoStore({mongoUrl: url})
}));

//Flash
app.use(flash());

app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.fullName = req.session.fullName || null;
    res.locals.role = req.session.role || null;
    res.locals.email = req.session.email || null;
    res.locals.id = req.session.user || null;
    res.locals.successMessages = req.flash('success');
    res.locals.errorMessages = req.flash('error');
    next();
});

//set up routes
app.use('/', mainRoutes);
app.use('/programs', programRoutes);
app.use('/users', userRoutes);

app.use((req, res, next) => {
    let err = new Error('The server cannot locate resource ' + req.url);
    err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {
    if (!err.status) {
        err.status = 500;
        err.message = ('Internal Server Error');
    } 
    res.status(err.status);
    console.log(err.stack);
    res.render('./error', {error: err});
});

//Email reminders
eventReminders.initScheduledJobs();
