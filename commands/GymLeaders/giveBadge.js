const { SlashCommandBuilder } = require('discord.js');
const GymSchema = require('../../mongo/Schemas/Gyms');
const UserSchema = require('../../mongo/Schemas/user');
const { levelup, levelupRareCandy } = require('../../Utils/miscFunc');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('givebadge')
        .setDescription('Give Badge to a Player')
        .addStringOption(option => option
            .setName('discordid')
            .setDescription('The DiscordID of the User')
            .setRequired(true)
        ),
    async execute(interaction) {
        const gymLeaderID = interaction.user.id;

        const options = interaction.options._hoistedOptions;
        const UserDiscordID = options.find(option => option.name === 'discordid').value;

        const gymLeader = await GymSchema.findOne({ DiscordID: gymLeaderID });
        if (!gymLeader) {
            return await interaction.reply({ content: `You are not a Gym Leader` });
        }

        const user = await UserSchema.findOne({ DiscordID: UserDiscordID });
        if (!user) {
            return await interaction.reply({ content: `User not found` });
        }

        if (user.Badges.includes(gymLeader.Badge)) {
            return await interaction.reply({ content: `User already has this Badge` });
        }

        console.log(gymLeader.Badge)

        console.log(gymLeader.Badge.currentlow, gymLeader.Badge.nextlow)
        user.WildRef.lastGymLow = gymLeader.Badge.currentlow;
        user.WildRef.nextGymLow = gymLeader.Badge.nextlow;

        user.Badges.push(gymLeader.Badge);

        await user.save();

        await interaction.reply({ content: `Badge Given` });
    }
}