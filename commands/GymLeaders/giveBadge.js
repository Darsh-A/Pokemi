const { SlashCommandBuilder } = require('discord.js');
const GymSchema = require('../../mongo/Schemas/Gyms');
const UserSchema = require('../../mongo/Schemas/user');


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
        
        const user = interaction.user.id

        const GymLeader = await GymSchema.findOne({ DiscordID : user });

        if (!GymLeader) return interaction.reply(`You are not a Gym Leader`);

        const options = interaction.options;
        const PlayerID = options.getString('discordid');

        const Player = await UserSchema.findOne({ DiscordID : PlayerID });

        if (!Player) return interaction.reply(`User not found`);

        if (Player.Badges.includes(GymLeader.Badge)) return interaction.reply(`User already has this badge`);

        Player.Badges.push(GymLeader.Badge);

        // update the data of the player in mongo

        await UserSchema.findOneAndUpdate({ DiscordID: PlayerID }, { Badges: Player.Badges });

        return interaction.reply(`Badge ${GymLeader.Badge} Given to <@${PlayerID}>`); 

    }
}