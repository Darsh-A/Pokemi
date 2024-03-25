const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const GymUser = require('../../mongo/Schemas/Gyms');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addgym')
        .setDescription('Registers a Gym Leader')
        .addStringOption(option => option
            .setName('discordid')
            .setDescription('ID of the User')
            .setRequired(true))
        .addStringOption(option => option
            .setName('type')
            .setDescription('Type of Gym')
            .setRequired(true)),

    async execute(interaction) {
        const { Gyms } = require('../../Utils/gymLeadersData')
        const gymData = await Gyms();
        console.log(gymData[0])
        // Ensure gymData is an array
        if (!Array.isArray(gymData)) {
            console.error('Gym data is not an array');
            return;
        }


        const options = interaction.options._hoistedOptions;
        const discordID = options.find(option => option.name === 'discordid').value;
        const type = options.find(option => option.name === 'type').value;

        const gym = gymData.find(gym => gym.Type.toLowerCase() === type.toLowerCase());

        if (!gym) {
            return await interaction.editReply({ content: `Gym Type not found` });
        }

        const newGym = new GymUser({
            DiscordID: discordID,
            Name: interaction.user.username,
            Badge: gym.Badge,
            Type: gym.Type,
            Location: gym.Location,
            LvlMin: gym.LvlMin,
            LvlMax: gym.LvlMax,
        });

        await newGym.save();

        await interaction.editReply({ content: `Gym Leader Registered` });

    }
}