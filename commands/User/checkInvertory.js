const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const UserSchema = require('../../mongo/Schemas/user');
const { InvItem } = require('../../Utils/UtilityClasses')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('inventory')
        .setDescription('Checks the User Inventory'),

    async execute(interaction) {

        const userid = interaction.user.id;
        
        const user = await UserSchema.findOne({ DiscordID : userid });

        if (!user) return interaction.reply(`User <@${userid}> Not Registered`)

        const inventory = user.Items;

        let items = [];

        for (const item of inventory) {
            items.push({"name": item.name, "quantity": item.quantity})
        }
        
        const embed = new EmbedBuilder()
            .setTitle(`Inventory of <@${userid}>`)
            .addFields(items)
            .setColor('#e36d83')
            .setTimestamp()
        
        await interaction.reply({ embeds: [embed] });
        
    }
}