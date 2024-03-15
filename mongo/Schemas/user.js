const { Schema, model } = require('mongoose');

let user = new Schema({
    DiscordID: String,
    Items: Array,
    Money: Number,
    AllPokemons: Array,
    AllMoves: Array,
    Team: Array,
});

module.exports = model('User', user);