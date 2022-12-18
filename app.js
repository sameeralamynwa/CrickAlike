const express = require("express");
const path = require("path");
const fs = require("fs");
const sdk = require("microsoft-cognitiveservices-speech-sdk");
const axios = require('axios')


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
const cors = require('cors')

const URL = 'mongodb+srv://admin:123@cluster0.bexjc35.mongodb.net/?retryWrites=true&w=majority';

mongoose.connect(URL, {useNewUrlParser: true});
// mongoose.connect(process.env.MONGODB_URI, {useNewUrlParser: true});

// const port = process.env.PORT || 5000;
const port = 5000;

app.use(cors({origin: "*"}))

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

let event = "nothing"

app.get('/event', function(req, res) {
    res.send(event);
    event = "nothing"
})

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
                name.push(result[i].tournament + " " + result[i].format + " - " + result[i].team_one + " vs " + result[i].team_two);
                path.push(convertToPath(result[i].tournament + "-" + result[i].format + "-" + result[i].team_one + "-" + result[i].team_two));
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

app.get('/explore/:path', async function(req, res) {
    let path = req.params.path + ".wav";
    const model_url = "http://localhost:4444/predict_event"

    const speechConfig = sdk.SpeechConfig.fromSubscription("a99e3201094941d99e9a24687843c47e", "eastus");
    const audioConfig = sdk.AudioConfig.fromWavFileInput(fs.readFileSync("match_videos/world-cup-t20-india-pakistan.wav"));

    speechConfig.speechRecognitionLanguage = "en-US";
    const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

    recognizer.recognizing = (s, e) => {
        // console.log(`RECOGNIZING: Text=${e.result.text}`);
    };

    recognizer.recognized = (s, e) => {
        if (e.result.reason == sdk.ResultReason.RecognizedSpeech) {
            console.log(`RECOGNIZED: Text=${e.result.text}`);
            
            let body = {
                'commentary': e.result.text
            };

            const ball_prediction = async () => {
                try {
                    body.commentary = body.commentary.replace("4", " four ");
                    body.commentary = body.commentary.replace("6", " six ");
                    body.commentary = body.commentary.replace("sick", " six ");

                    const res = await axios.get(model_url + '/' + body.commentary)
                    console.log(`Status: ${res.status}`)
                    event = res.data.predicted_event;

                    if (body.commentary.includes("four")){
                        res.data = { "predicted_event": 'four' }
                        event = "four"
                    }
                    else if(body.commentary.includes("six")){
                        res.data = { "predicted_event": 'six' };
                        event = "six"
                    }
                    console.log('Body: ', res.data)
                    
                }
                catch (err) {
                    console.error(err)
                }
            }
              
            ball_prediction()
        }
        else if (e.result.reason == sdk.ResultReason.NoMatch) {
            console.log("NOMATCH: Speech could not be recognized.");
        }
    };

    recognizer.canceled = (s, e) => {
        console.log(`CANCELED: Reason=${e.reason}`);

        if (e.reason == sdk.CancellationReason.Error) {
            console.log(`"CANCELED: ErrorCode=${e.errorCode}`);
            console.log(`"CANCELED: ErrorDetails=${e.errorDetails}`);
            console.log("CANCELED: Did you set the speech resource key and region values?");
        }

        recognizer.stopContinuousRecognitionAsync();
    };

    recognizer.sessionStopped = (s, e) => {
        console.log("\n    Session stopped event.");
        recognizer.stopContinuousRecognitionAsync();
    };

    recognizer.startContinuousRecognitionAsync();

    // let body = {
        // 'commentary': "Shaheen Afridi to Kohli 4. That's a four. Kohli gets to his 50 has been an excellent knock that was short. Kohli fetches it from well off side and pulls it wide off deep mid that landed just short of the fence. But this has been such an excellent knock from Kohli."
        // 'commentary': "Maharaj to Ishan Kishan, SIX, fraction short and Ishan Kishan is onto it in a flash! Swivels on the back foot and thrashes the pull flat and long over deep mid-wicket"
        // 'commentary': "Ngidi to Shreyas Iyer, out Caught by Rabada!! There's the wicket and most probably the game. Ngidi kept hitting the deck hard and the line was also tight. Iyer just couldn't get it away and he perishes trying to play the big shot. This was a short of length delivery and Iyer is deceived by the extra bounce, the pull comes off the higher part of the bat and the ball lobs to mid-on, simple catch to Rabada. Shreyas Iyer c Rabada b Ngidi 50(37) [4s-8]"
    // };
})

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