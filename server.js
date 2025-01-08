const express = require("express");
const app = express();
const session = require('express-session');
const passport = require('./config/passport')
const path = require("path");
const env = require("dotenv").config();
const db = require("./config/db")
const userRouters = require("./routers/userRouters");
const adminrouters = require("./routers/adminrout")
const nocache = require('nocache');
const MongoDBStore = require("connect-mongodb-session")(session);
db()



app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(nocache());

const store = new MongoDBStore({
    uri:process.env.MONGODB_URI,
})

store.on('error',(error)=>{
    console.log('Error connecting to mongostore')
})

app.use(session({
    secret: process.env.SESSION_SEACRET,
    // secret:'mySecret',
    store,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,
        httpOnly: true, 
        maxAge: 72 * 60 * 60 * 1000
    }

}))

app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
    res.locals.user = req.user || null; // Make `req.user` available in all templates
    next();
});


app.set("view engine", "ejs");
app.set("views", [path.join(__dirname, 'views/user'), path.join(__dirname, 'views/admin')]);
app.use(express.static(path.join(__dirname, 'public')));




app.use("/", userRouters);
app.use("/admin", adminrouters)

app.listen(process.env.PORT, () => console.log("server running :", process.env.PORT));




// module.exports = app;