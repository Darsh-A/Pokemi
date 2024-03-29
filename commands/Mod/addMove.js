const { SlashCommandBuilder } = require('discord.js');
const UserSchema = require('../../mongo/Schemas/user');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addmove')
        .setDescription('Add Move to a Users Move List')
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

        if (!user) return interaction.editReply(`User <@${UserID}> Not Registered`)

        await UserSchema.findOneAndUpdate({ DiscordID: UserID }, {
            $push: {
                AllMoves: Move
            }
        })

        await interaction.editReply(`Added ${Move} to <@${UserID}>`)

    }
}