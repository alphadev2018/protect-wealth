const express = require('express');
const path = require('path');
const fs = require('fs');
var cors = require('cors');

const dotenv = require('dotenv');
dotenv.config();

const Auth = require('./modules/auth/router.js');
const Course = require('./modules/course/router.js');
const Activity = require('./modules/activity/router.js');

require('./config/db_connection.js');
require('./config/passport.js');

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bodyParser = require('body-parser');
var multer = require('multer');
const app = express();

app.use(cors())

var cookieParser = require('cookie-parser');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (req.query.courseId && !fs.existsSync(__dirname+'/public/uploads/'+req.query.courseId)) {
            fs.mkdirSync(__dirname+'/public/uploads/'+req.query.courseId);
        }
        if (req.query.mode === 'coverimage') {            
            if (fs.existsSync(__dirname+'/public/uploads/'+req.query.courseId+'/cover.png')) {
                fs.unlinkSync(__dirname+'/public/uploads/'+req.query.courseId+'/cover.png');
            }
            cb(null, './public/uploads/'+req.query.courseId);
        } if (req.query.mode === 'video' || req.query.mode === 'section') {
            cb(null, './public/uploads/'+req.query.courseId);
        } else {
            cb(null, './public/uploads/');
        }
    },
    filename: function (req, file, cb) {
        /*if (!file.originalname.match(/\.(jpeg|jpg|png)$/)) {
            var err = new Error();
            err.code = 'filetype';
            return cb(err);
        } else {
            cb(null, Date.now() + '-' +  file.originalname);
        }*/
        if (req.query.mode === 'coverimage') {
            cb(null, 'cover.png');
        } else {
            cb(null, Date.now() + '-' +  file.originalname); 
        }
    }
})

var upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 }
}).single('file');

app.use(require('express-session')({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));

app.use(cookieParser());

// parse application/x-www-form-urlencoded 
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json 
app.use(bodyParser.json());

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, 'public')));

  
app.use('/auth', Auth);
app.use('/courses', Course);
app.use('/activity', Activity);

// FileUpload
app.post('/upload', function (req, res) {
    upload(req, res, function (err) {
        if (err) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                res.json({ success: false, message: 'The file size is too big! Max. 10MB' });
            } else if (err.code === 'filetype') {
                res.json({ success: false, message: 'The file does not match the desired file format! (JPG, JPEG, PNG)'});
            }else {
                console.log(err);
                res.json({success: false, message: 'The upload of the file could not be completed.'});
            }
        }else{
            if(!req.file){
                res.json({success: false, message: 'No file was selected for upload!'});
            }else{
                res.json({success: true, message: 'The file has been uploaded successfully.', file: req.file});
            }
        }
    })
})


// error handlers
// Catch unauthorised errors
app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
      res.status(401);
      res.json({"message" : err.name + ": " + err.message});
    }
});

app.get("*", function(req, res) {
    res.sendFile(path.join(__dirname, "./public/index.html"));
});

// web server 8080
app.listen(80, () => console.log('-- [ PROTECTWEALTH NODE ] SERVER STARTED LISTENING ON PORT 8888 --'));