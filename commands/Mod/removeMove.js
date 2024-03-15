const { SlashCommandBuilder } = require('discord.js');
const UserSchema = require('../../mongo/Schemas/user');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removemove')
        .setDescription('Removes Move to a Users Move List')
        .setDefaultMemberPermissions(0)
        .addStringOption(option => option
            .setName('discordid')
            .setDescription('The Discord ID of the User')
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('move')
            .setDescription('The Moves Name')
            .setRequired(true)
        ),

    async execute(interaction) {

        const options = interaction.options;
        const UserID = options.getString('discordid');  
        const Move = options.getString('move');

        const user = await UserSchema.findOne({ DiscordID: UserID });

        if (!user) return interaction.reply(`User <@${UserID}> Not Registered`)

        await UserSchema.findOneAndUpdate({ DiscordID: UserID }, {
            $pull: {
                AllMoves: Move
            }
        })

        await interaction.reply(`Removed ${Move} from <@${UserID}>`)

    }
}