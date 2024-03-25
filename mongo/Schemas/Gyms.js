const { Schema, model } = require('mongoose');
const { Badges } = require('../../Utils/UtilityClasses');

let GymUser = new Schema({
    DiscordID: String,
    Name: String,
    Badge: Object,
    Type: String,
    Location: String,
    LvlMin: Number,
    LvlMax: Number,
});

module.exports = model('GymUser', GymUser);