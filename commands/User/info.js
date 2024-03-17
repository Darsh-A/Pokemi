const { SlashCommandBuilder } = require('discord.js');
const UserSchema = require('../../mongo/Schemas/Gyms');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Get your info'),

    async execute(interaction) {


        const userid = interaction.user.id;

        const user = await UserSchema.findOne({ DiscordID: userid });

        if (!user) return interaction.reply("User Not Found");

        if (!user) {
            return interaction.reply('You are not Registered');
        }

        const team = user.Team;

        const pokemon = team[0]

        const sprite = pokemon.Sprite;

        await interaction.guild.emojis.create(sprite, 'sprite');
    }
}