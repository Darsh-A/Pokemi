const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('moveinfo')
        .setDescription('Know what that move do')
        .addStringOption(option => option
            .setName('move')
            .setDescription('Name of the move')
            .setRequired(true)
        ),

    async execute(interaction) {


        const move = interaction.options.getString('move');
        const response = await axios.get(`https://pokeapi.co/api/v2/move/${move.toLowerCase()}`);

        if (!response) return interaction.reply("Move Doesnt Exist");

        const accuracy = response.data.accuracy || "None";
        const power = response.data.power || "None";
        const pp = response.data.pp || "None";
        const type = response.data.type.name || "None";
        const dmgClass = response.data.damage_class.name || "None";
        const descp = response.data.flavor_text_entries[0].flavor_text || "None";


        const embed = new EmbedBuilder()
            .setTitle(move)
            .setDescription(`
                ${descp} \n
                Accuracy: ${accuracy} \n
                Power: ${power} \n
                 PP: ${pp} \n
                Type: ${type} \n
                Damage Class: ${dmgClass}
            `)
            .setColor('#b984cf')
            .setTimestamp();

        try {
            await interaction.reply({ embeds: [embed] });
        }
        catch (err) {
            console.log(err);
        }
        
    }
}