const { SlashCommandBuilder } = require('discord.js');
const UserSchema = require('../../mongo/Schemas/user');
const { InvItem } = require('../../Utils/UtilityClasses');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('additem')
        .setDescription('Add a Item to the User')
        .setDefaultMemberPermissions(0)
        .addStringOption(option => option
            .setName('discordid')
            .setDescription('The Discord ID of the User')
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('item')
            .setDescription('The Item Name')
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('amount')
            .setDescription('The Amount of the Item')
            .setRequired(true)
        ),

    async execute(interaction) {

        const options = interaction.options;
        const UserID = options.getString('discordid');
        const Item = options.getString('item');
        const Amount = parseInt(options.getString('amount'));

        const user = await UserSchema.findOne({ DiscordID: UserID });
        if (!user) return interaction.reply(`User <@${UserID}> Not Registered`);

        const rarecandyIndex = user.Items.findIndex(item => item.name === Item);

        if (rarecandyIndex === -1) {
            // Item not found, add a new item
            const newItem = new InvItem(Item, Amount);
            user.Items.push(newItem);
            await UserSchema.updateOne({ DiscordID: UserID }, { Items: user.Items });
            return interaction.reply(`Added ${Amount} ${Item} to <@${UserID}>`);
        } else {
            // Item found, update its amount
            const rarecandy = user.Items[rarecandyIndex];
            rarecandy.amount += Amount;
            await UserSchema.updateOne({ DiscordID: UserID }, { Items: user.Items });
            return interaction.reply(`Added ${Amount} ${Item} to <@${UserID}>`);
        }


    }
}