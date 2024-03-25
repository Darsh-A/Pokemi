const { SlashCommandBuilder } = require('discord.js');

const { uploadEmojiOther } = require('../../Utils/miscFunc');

const vision = require('@google-cloud/vision');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('test')
        .setDescription('what does the command do'),

    async execute(interaction) {

        uploadEmojiOther(interaction,"https://static.wikia.nocookie.net/pokemon/images/5/53/Iciclebadge.png", "Ice")
    }
}