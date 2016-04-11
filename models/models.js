var mongoose = require('mongoose');


var userSchema = new mongoose.Schema({
    username: String,
    password: String, //hash created from password
    created_at: {type: Date, default: Date.now}
});

var postSchema = new mongoose.Schema({
     text: String,
    created_by: String,
    created_at: {type: Date, default: Date.now}
   
});

mongoose.model('Post', postSchema);
mongoose.model('User', userSchema);