const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const { checkPokemonExists, getType, getSprites, getStats } = require('../../Utils/UtilityClasses');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pokedex')
        .setDescription('Know what that pokemon doin')
        .addStringOption(option => option
            .setName('name')
            .setDescription('Guess what, you put the pokemon name here, Surprising right?')
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('gen')
            .setDescription('Generation ')
            .setRequired(true)
        ),

    async execute(interaction) {

        const name = interaction.options.getString('name');
        const gen = interaction.options.getString('gen');
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`);

        const data = response.data;

        if (!checkPokemonExists(gen, name)) return "No Pokemon Found";

        const types = await getType(gen, name);
        const sprites = await getSprites(gen, name, false);
        const weight = "Less than your mom";
        const stats = await getStats(gen, name);

        const statString = Object.entries(stats)
            .map(([stat, value]) => `${stat}: ${value}`)
            .join('\n');

        const embed = new EmbedBuilder()
            .setTitle(name)
            .setImage(sprites)
            .setDescription(
                `**Types**: ${types.join(", ")}\n` +
                `**Weight**: ${weight}\n\n` +
                `**Stats**:\n ${statString}`
            )
            .setThumbnail('https://i.postimg.cc/T1zJ42PF/pngwing-com.png')
            .setColor('#cc5877')

        await interaction.editReply({ embeds: [embed] });


    }
}