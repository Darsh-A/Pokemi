const { Schema, model } = require('mongoose');

let user = new Schema({
    DiscordID: String,
    Items: Array,
    Money: Number,
    AllPokemons: Array,
    Team: Array,
    Badges: Array,
    Exp: Number,
    WildRef: {
        lastGymLow: Number,
        nextGymLow: Number
    },
});

module.exports = model('User', user);