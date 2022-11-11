const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express()
app.locals.moment = require('moment');
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const res = require("express/lib/response");
const { query } = require("express");
const { userInfo } = require("os");
const session = require("express-session");
const MongoDBSession = require("connect-mongodb-session")(session);

const URL = 'mongodb+srv://admin:123@cluster0.bexjc35.mongodb.net/?retryWrites=true&w=majority';

mongoose.connect(URL, {useNewUrlParser: true});
// mongoose.connect(process.env.MONGODB_URI, {useNewUrlParser: true});

// const port = process.env.PORT || 5000;
const port = 5000;

app.use('/static', express.static('static'));
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

const store = new MongoDBSession({
    uri: URL,
    // uri: process.env.MONGODB_URI,
    collection: 'mysessions'
});

app.use(session({
    secret: "my-secret-key",
    saveUninitialized: false,
    resave: false,
    store: store
}));

const isAuth = (req, res, next) => {
    if(req.session.isAuth == true){
        next();
    }
    else{
        res.redirect('/login');
    }
}

let MatchSchema = new mongoose.Schema({
    tournament: String,
    team_one: String,
    team_two: String,
    umpires: [],
    venue: String,
    format: String,
    sponsors: []
});

let TeamSchema = new mongoose.Schema({
    players: [],
    country: String,
    captain: String,
    coaches: [],
    teamsponsors: []
})

let RegistrationSchema = new mongoose.Schema({
    name: String,
    handle: String,
    email: String,
    password: String,
});

let TeamSchemaModel = mongoose.model('TeamTable', TeamSchema);
let RegistrationSchemaModel = mongoose.model('RegistrationTable', RegistrationSchema);
let MatchSchemaModel = mongoose.model('MatchTable', MatchSchema);


app.get('/', function (req, res) {
    const params = {
        isAuth: req.session.isAuth,
        handle: req.session.handle,
        title: '- Find your favourite players play for free'
    }
    res.status(200).render('home.pug', params);
});

app.get('/login', function (req, res) {
    const params = {
        isAuth: req.session.isAuth,
        handle: req.session.handle,
        title: '- Login'
    }
    res.status(200).render('login.pug', params);
});

app.get('/register', function (req, res) {
    const params = {
        isAuth: req.session.isAuth,
        handle: req.session.handle,
        title: '- Register'
    }
    res.status(200).render('registrationform.pug', params);
});

app.get('/explore', function (req, res) {
    let name = []
    let path = []
    MatchSchemaModel.find().then(result => {
        if(result.length){
            for(let i = 0; i < result.length; ++i){
                name.push(result[i].tournament + " - " + result[i].team_one + " vs " + result[i].team_two);
                path.push(convertToPath(result[i].tournament));
            }
        }
        else{
            res.status(404).end("No matches added");
        }
        let params = {
            isAuth: req.session.isAuth,
            handle: req.session.handle,
            title: '- Explore',
            name: name,
            path: path
        }
        res.status(200).render('explore.pug', params);
    }).catch(error => {
        console.log(error);
        res.status(404).end("An error occured while fetching the information for all matches.");
    });
});

app.post('/register', async function (req, res) {
    let {name, handle, email, password} = req.body;
    name = name.trim();
    handle = handle.trim();
    email = email.trim();
    passsword = password.trim();

    if(name == "" || handle == "" || email == "" || password == ""){
        return res.status(404).end("Empty input fields");
    }

    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, salt);

    RegistrationSchemaModel.find({email}).then(result => {
        if(result.length){
            res.status(404).end("A user already exists with this email.");
        }
        else{
            const newUser = new RegistrationSchemaModel({
                name,
                handle,
                email,
                password
            });
        }
    }).catch(error => {
        console.log(error);
        res.status(404).end("An error occured while fetching the information for existing users.");
    });

    RegistrationSchemaModel.find({handle}).then(result => {
        if(result.length){
            res.status(404).end("A user already exists with this handle.");
        }
        else{
            const newUser = new RegistrationSchemaModel({
                name,
                handle,
                email,
                password
            });
            newUser.save().then(result => {
                res.status(200).render('successregistration.pug');
            }).catch(error => {
                res.status(404).end("An error occured while saving the information for the user.");
            })
        }
    }).catch(error => {
        console.log(error);
        res.status(404).end("An error occured while fetching the information for existing users.");
    });

});

app.post('/login', async function (req, res) {
    console.log(req.body);
    const user = await RegistrationSchemaModel.find({handle: req.body.handle});
    console.log(user);
    if(user.length){
        bcrypt.compare(req.body.password, user[0].password, function(err, result) {
            if (result) {
                req.session.isAuth = true;
                req.session.handle = req.body.handle;
                res.status(200).render('loginsuccess.pug', {isAuth: true, handle: req.body.handle});
            }
            else {
                res.status(404).end("Incorrect password.");
            }
          });
    }
    else{
        res.status(404).end("No such handle exists.");
    }
});

app.get('/logout', function(req, res) {
    req.session.destroy((error) => {
        if(error){
            throw error;
        }
        res.redirect('/');
    })
});

app.get('/about', function (req, res) {
    const params = {
        isAuth: req.session.isAuth,
        handle: req.session.handle,
        title: '- About'
    }
    res.status(200).render('about.pug', params);
});

function convertToPath(word){
    word = word.toLowerCase();
    word = word.replace(" ", "-");
    return word;
}

function convertToName(word){
    word = word.replace("-", " ");
    const list = word.split(" ");
    for (var i = 0; i < list.length; i++) {
        list[i] = list[i].charAt(0).toUpperCase() + list[i].slice(1);
    }
    return list.join(" ");
}

app.listen(port, function () {
    console.log(`Listening at port ${port}`);
});