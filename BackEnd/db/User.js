const mongoose = require('mongoose');
const { type } = require('os');

const UserSchema = new mongoose.Schema({
    username : {type : String , unique : true},
    password : String
},{timestamps:true})

const UserModel = mongoose.model('User', UserSchema);
module.exports = UserModel;