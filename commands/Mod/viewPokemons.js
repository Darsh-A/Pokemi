const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const UserSchema = require('../../mongo/Schemas/user');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('viewpokemons')
        .setDescription('Shows the Pokemons of a User')
        .setDefaultMemberPermissions(0)
        .addStringOption(option => option
            .setName('discordid')
            .setDescription('The Discord ID of the User')
            .setRequired(true)
        ),

    async execute(interaction) {

        const options = interaction.options;
        const UserID = options.getString('discordid');  

        const user = await UserSchema.findOne({ DiscordID: UserID });

        if (!user) return interaction.reply(`User <@${UserID}> Not Registered`)

        const userPokemons = user.Team;
        if (userPokemons.length === 0) return interaction.reply(`User <@${UserID}> Has No Pokemons`)


        let poks = [];
        
        for (let i = 0; i < userPokemons.length; i++) {
            userPokemons[i] = `${i + 1}. ${userPokemons[i].species} - Lvl ${userPokemons[i].level}`

            poks.push(userPokemons[i])
        }

        const embed = new EmbedBuilder()
            .setTitle(`Pokemons of <@${UserID}>`)
            .setDescription(poks.join('\n'))
            .setColor('#b982e0')
            .setTimestamp()
        
        await interaction.reply({ embeds: [embed] })
    }
}