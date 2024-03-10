const { Schema, model } = require('mongoose');

let test = new Schema({
    name: String,
});

module.exports = model('test', test);