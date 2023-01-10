//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require('mongoose');
//var imgModel = require('./model');

var fs = require('fs');
var path = require('path');
require('dotenv/config');

mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGO_URL);



const postSchema = {
  title: String, 
  content: String 
 };

 const Post = mongoose.model("Post", postSchema);

 var imageSchema = new mongoose.Schema({
  title: String,
  content1: String,
  content2: String,
  content3: String,
  name: String,
  desc: String,
  img:
  {
      data: Buffer,
      contentType: String
  }
});

const Image = new mongoose.model("Image", imageSchema);

const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static("public"));



//let posts = [];

app.get("/", function(req, res){
  Post.find({}, function(err, posts){
    res.render("home", {
      startingContent: homeStartingContent,
      posts: posts
      });
 
  })
  /*res.render("home", {
    startingContent: homeStartingContent,
    posts: posts
    });*/
});

app.get("/about", function(req, res){
  res.render("about", {aboutContent: aboutContent});
});

app.get("/contact", function(req, res){
  res.render("contact", {contactContent: contactContent});
});

app.get("/compose", function(req, res){
  res.render("compose");
});

app.post("/compose", function(req, res){


  const post = new Post ({
    title: req.body.postTitle, 
    content: req.body.postBody 
  });

  post.save(function(err){
    if (!err){
      res.redirect("/");
    }
  });

});

app.get("/posts/:postId", function(req, res){
  const requestedPostId = req.params.postId;

  Post.findOne({_id: requestedPostId}, function(err, post){ 
    res.render("post", {

      title: post.title,
 
      content: post.content
 
    });
  });
  /*posts.forEach(function(post){
    const storedTitle = _.lowerCase(post.title);

    if (storedTitle === requestedTitle) {
      res.render("post", {
        title: post.title,
        content: post.content
      });
    }
  });*/

});

app.get("/image", (req, res) => {
  Image.find({}, (err, items) => {
      if (err) {
          console.log(err);
          res.status(500).send('An error occurred', err);
      }
      else {
          res.render("imagesPage", { items: items });
      }
  });
  console.log("iza find");
});

var multer = require('multer');
 
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
});
 
var upload = multer({ storage: storage }); 
//var upload = multer({ dest: "./uploads/" }); 


app.post("/image", upload.single("image"), (req, res, next) => {
  var obj = {
      title: req.body.postTitle, 
      content1: req.body.postBody1,
      content2: req.body.postBody2,
      content3: req.body.postBody3,
      name: req.body.name,
      desc: req.body.desc,
      img: {
          data: fs.readFileSync(path.join(__dirname + "/uploads/" + req.file.filename)),
          contentType: 'image/png'
      }
  }
  Image.create(obj, (err, item) => {
      if (err) {
          console.log(err);
      }
      else {
           item.save();
          res.redirect('/image');
      }
  });
});

var port = process.env.PORT || '3000';
app.listen(port, err => {
    if (err)
        throw err
    console.log('Server listening on port', port)
});
