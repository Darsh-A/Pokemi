const { Schema, model } = require('mongoose');

let GymUser = new Schema({
    DiscordID: String,
    Name: String,
    Team: Array,
    Badge: String,
    Type: String,
    Location: String,
    LvlMin: Number,
    LvlMax: Number,
});

module.exports = model('GymUser', GymUser);