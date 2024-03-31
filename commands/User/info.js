const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const UserSchema = require('../../mongo/Schemas/user');
const { uploadEmoji, deleteEmoji, uploadEmojiOther } = require('../../Utils/miscFunc');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Get your info'),

    async execute(interaction) {
        const userid = interaction.user.id;
        const channel = interaction.channel;

        const user = await UserSchema.findOne({ DiscordID: userid });
        if (!user) {
            return interaction.reply('You are not registered');
        }

        const userTeam = user.Team;
        const userBadges = user.Badges;
        const userItems = user.Items;

        let emojiIDs = []; // To Delete all emojis later

        // Team Info Formatting
        let teamInfoFields = [];
        for (const pokemon of userTeam) {
            const emojiID = await uploadEmoji(interaction, pokemon);
            emojiIDs.push(emojiID);
            const index = userTeam.indexOf(pokemon);
            teamInfoFields.push(
                `Slot ${index + 1}: \n <a:${pokemon.id}:${emojiID}> - ${pokemon.species} - Lvl ${pokemon.level}\n`
            );
        }

        // Badges Info Formatting
        let userBadgesFields = [];
        if (userBadges.length === 0) {
            userBadgesFields.push("No Badges");
        } else {
            for (const badge of userBadges) {
                const badgeName = badge.name;
                const badgeIcon = badge.icon;
                const badgeEmojiID = await uploadEmojiOther(interaction, badgeIcon, badgeName);
                emojiIDs.push(badgeEmojiID);
                userBadgesFields.push(
                    `<:${badgeName}:${badgeEmojiID}> - ${badgeName}\n`
                );
            }
        }

        let userItemsFields = [];
        if (userItems.length === 0) {
            userItemsFields.push("No Items");
        } else {
            for (const item of userItems) {
                const itemName = item.name;
                const itemamount = item.amount;
                userItemsFields.push(
                    `${itemName}: ${itemamount}`
                );
            }
        }

        const embed = new EmbedBuilder()
            .setTitle(`${interaction.user.username}`)
            .setDescription(`Badges: \n${userBadgesFields.join('')} \n\nTeam: \n ${teamInfoFields.join('')} \nItems: \n${userItemsFields.join('')} \n\nMoney: \n${user.Money} \n\n`) 
            .setThumbnail(interaction.user.avatarURL())
            .setTimestamp()
            .setColor('#f76084');
        await channel.send({ embeds: [embed] });

        for (const ids of emojiIDs) {
            await deleteEmoji(interaction, ids);
        }   

    }
}
