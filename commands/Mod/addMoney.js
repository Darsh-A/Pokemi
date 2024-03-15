const { SlashCommandBuilder } = require('discord.js');
const UserSchema = require('../../mongo/Schemas/user');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addmoney')
        .setDescription('Add Money to a User')
        .setDefaultMemberPermissions(0)
        .addStringOption(option => option
            .setName('discordid')
            .setDescription('The Discord ID of the User')
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('amount')
            .setDescription('The Amount of Money to Add')
            .setRequired(true)
        ),

    async execute(interaction) {

        const options = interaction.options;
        const UserID = options.getString('discordid');  
        const Amount = options.getString('amount');

        const user = await UserSchema.findOne({ DiscordID: UserID });

        if (!user) return interaction.reply(`User <@${UserID}> Not Registered`)

        await UserSchema.findOneAndUpdate({ DiscordID: UserID }, {
            $inc: {
                Money: Amount
            }
        })

        await interaction.reply(`Added ${Amount} to <@${UserID}>`)

    }
}