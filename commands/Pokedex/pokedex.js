const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const {getPokemon} = require('pkmonjs')


module.exports = {
    data: new SlashCommandBuilder()
        .setName('pokedex')
        .setDescription('Gives information about a pokemon')
        .addStringOption(option => option
            .setName('name')
            .setDescription('Name of the Pokemon')
            .setRequired(true)
        ),
    async execute(interaction) {

        const channel = interaction.channel;

        const options = interaction.options;
        const Pok_name = options.getString('name');

        const poke = await getPokemon(Pok_name)

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(poke.name)
            // .setAuthor('Pokedex', 'https://i.imgur.com/5m8o7cM.png', 'https://www.pokemon.com/us/pokedex/')
            .setDescription(`***${poke.generation.name}*** \n ${poke.description}`) // TODO: Add Types
            .setThumbnail(poke.image.default)
            .addFields(
                { name: 'HP', value: poke.stats.hp.toString(), inline: true },
                { name: 'ATK', value:  poke.stats.attack.toString(), inline: true },
                { name: 'DEF', value:  poke.stats.defense.toString(), inline: true },
                { name: 'SP.ATK', value:  poke.stats.specialAttack.toString(), inline: true },
                { name: 'SP.DEF', value: poke.stats.specialDefense.toString(), inline: true },
                { name: 'SPD', value: poke.stats.speed.toString(), inline: true },
            )
            .setTimestamp()
            // .setFooter(poke.habitat.name, poke.habitat.url);

        channel.send({ embeds: [embed] });
    }
}