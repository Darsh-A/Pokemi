const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const UserSchema = require('../../mongo/Schemas/user');
const { convertToShowdownFormat } = require('../../Utils/miscFunc')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('battle')
        .setDescription('Gives Pokemon Showdown Format for your team'),

    async execute(interaction) {

        const userid = interaction.user.id;
        const user = await UserSchema.findOne({ DiscordID : userid });
        if (!user) return interaction.reply("User Not Found");

        const userTeam = user.Team;

        if (userTeam.length === 0) return interaction.reply("No Team Found");

        const showdownFormat = convertToShowdownFormat(JSON.stringify(userTeam));

        const embed = new EmbedBuilder()
        .setTitle("Your Team")
        .setDescription(showdownFormat)
        .setTimestamp()

        return interaction.reply({ embeds: [embed] });
        
    }
}