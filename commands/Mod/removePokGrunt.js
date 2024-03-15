const { SlashCommandBuilder } = require('discord.js');
const UserSchema = require('../../mongo/Schemas/user');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removepokemon')
        .setDescription('Removes a Pokemon from the User')
        .setDefaultMemberPermissions(0)
        .addStringOption(option => option
            .setName('discordid')
            .setDescription('The Discord ID of the User')
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('pokemon')
            .setDescription('The Pokemon Name')
            .setRequired(true)
        ),

    async execute(interaction) {

        const options = interaction.options;
        const UserID = options.getString('discordid');  
        const Pokemon = options.getString('pokemon');

        const user = await UserSchema.findOne({ DiscordID: UserID });

        if (!user) return interaction.reply(`User <@${UserID}> Not Registered`)

        await UserSchema.findOneAndUpdate({ DiscordID: UserID }, {
            $pull: {
                AllPokemons: Pokemon
            }
        })

        await interaction.reply(`Removed ${Pokemon} from <@${UserID}>`)

    }
}