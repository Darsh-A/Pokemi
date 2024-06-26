const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const UserSchema = require('../../mongo/Schemas/user');
const { getSprites, getType, getAligibleMoves, trainPokemon, levelUpPokemon, getEvolutions } = require('../../Utils/UtilityClasses');

const pokemonsPerPage = 5;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pokemons')
        .setDescription('Checks the User Pokemons')
        .addStringOption(option => option
            .setName('search')
            .setDescription('Search for specific Pokemon')
            .setRequired(false)
        ),

    async execute(interaction) {
        const options = interaction.options;
        const searchTerm = options.getString('search');
        const userid = interaction.user.id;
        const user = await UserSchema.findOne({ DiscordID: userid });

        if (!user) return interaction.reply(`User <@${userid}> Not Registered`);

        let UserPokemons = user.AllPokemons;

        if (searchTerm) {
            UserPokemons = UserPokemons.filter(pokemon => pokemon.species.toLowerCase().includes(searchTerm.toLowerCase()));
            if (UserPokemons.length === 0) return interaction.reply(`No Pokemons Found with the name ${searchTerm}`);
        }

        const totalPages = Math.ceil(UserPokemons.length / pokemonsPerPage);

        let page = 0;
        let start = 0;
        let end = pokemonsPerPage;

        const sendPage = async (page) => {
            const pokemons = UserPokemons.slice(start, end).map((pokemon, index) => {
                // Add index property starting from start + 1 for each Pokemon
                pokemon.index = start + 1 + index;
                return { name: `${pokemon.index}. ${pokemon.species}`, value: `Lvl ${pokemon.level.toString()}`, inline: false };
            });

            const embed = new EmbedBuilder()
                .setTitle(`Your Inventory (Page ${page + 1}/${totalPages})`)
                .addFields(pokemons)
                .setColor('#e36d83')
                .setTimestamp()
                .setThumbnail('https://i.postimg.cc/yYt8WYNq/pngaaa-com-259223.png');

            let MenuOptions = []
            // Add options for each Pokémon on the page
            UserPokemons.slice(start, end).forEach((pokemon) => {
                MenuOptions.push(
                    new StringSelectMenuOptionBuilder()
                        .setLabel(pokemon.species)
                        .setValue(pokemon.index.toString())
                );
            });

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('previous_page')
                        .setLabel('Previous')
                        .setStyle('Primary')
                        .setDisabled(page === 0),
                    new ButtonBuilder()
                        .setCustomId('next_page')
                        .setLabel('Next')
                        .setStyle('Primary')
                        .setDisabled(page === totalPages - 1),

                );
            const selectRow = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('select_pokemon')
                        .setPlaceholder('Select a Pokémon...')
                        .addOptions(MenuOptions)
                );


            if (!interaction.replied) {
                await interaction.reply({ embeds: [embed], components: [row, selectRow] });
            } else {
                await interaction.editReply({ embeds: [embed], components: [row, selectRow] }).catch(error => console.log('editReply errored', error));
            }
        };

        await sendPage(page);

        const filter = i => i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000, max: 50 });

        collector.on('collect', async i => {
            await i.deferUpdate()
            if (i.customId === 'previous_page') {
                console.log('Previous Page Clicked');
                page--;
                start = page * pokemonsPerPage;
                end = start + pokemonsPerPage;
                await sendPage(page).catch(error => console.log('editReply errored', error));
            } else if (i.customId === 'next_page') {
                console.log('Next Page Clicked');
                page++;
                start = page * pokemonsPerPage;
                end = start + pokemonsPerPage;
                await sendPage(page).catch(error => console.log('editReply errored', error));
            } else if (i.customId === 'select_pokemon') {

                await collector.stop()

                console.log("Pokemon Selected: ", i.values[0])

                const selectedPokemonIndex = i.values[0];
                const selectedPokemon = UserPokemons.find((pokemon) => pokemon.index === parseInt(selectedPokemonIndex));
                const sprite = await getSprites(selectedPokemon.gen, selectedPokemon.species, false);
                const types = await getType(selectedPokemon.gen, selectedPokemon.species);
                const moves = selectedPokemon.moves;


                let movefields = [];
                for (const move of moves) {
                    movefields.push({ name: '-', value: move, inline: true });
                }

                // Update the embed with more information about the selected Pokémon
                let rarecandy = user.Items.find(item => item.name.toLowerCase() === "rarecandy");
                if (rarecandy) {
                    rarecandy = rarecandy.amount;
                }
                else {
                    rarecandy = 0;
                }
                const Pokemon_embed = new EmbedBuilder()
                    .setTitle(selectedPokemon.species)
                    .setDescription(` Level: ${selectedPokemon.level.toString()} \n Ability: ${selectedPokemon.ability} \n Nature: ${selectedPokemon.nature} \n Types: ${types.join(',')}`)
                    .addFields(
                        movefields
                    )
                    .setThumbnail(sprite)
                    .setColor('#e36d83')
                    .setFooter({ text: `Rare Candy: ${rarecandy} | 1 RareCandy = 1 Level`, iconURL: 'https://i.postimg.cc/52gBWdNY/image.png' })

                const trainRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('levelup_pokemon')
                            .setLabel('LevelUp')
                            .setStyle('Primary')
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('train_pokemon')
                            .setLabel('Train')
                            .setStyle('Primary')
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('close_interaction')
                            .setLabel('Close')
                            .setStyle('Primary')
                    )

                // Edit the existing message with the updated embed
                const PokemonInt = await interaction.editReply({ embeds: [Pokemon_embed], components: [trainRow] }); // Send the Pokemon Embed the first time

                const filter = i => i.user.id === interaction.user.id;
                const trainCollector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

                trainCollector.on('collect', async i => {

                    if (i.customId === 'train_pokemon') {

                        trainCollector.stop();
                        await i.deferUpdate()

                        const eligibleMoves = await getAligibleMoves(selectedPokemon.id, userid);
                        const learnedMoves = selectedPokemon.moves

                        let MoveReplace = false;

                        if (learnedMoves.length === 4) {
                            MoveReplace = true;
                            console.log("MoveReplace: ", MoveReplace)
                        }

                        if (eligibleMoves.length === 0) {
                            return 'No Moves Found';
                        }

                        let selectMoveOptions = [];
                        for (const move of eligibleMoves) {
                            selectMoveOptions.push(new StringSelectMenuOptionBuilder().setLabel(move).setValue(move));
                        }

                        let learnedMoveOptions = [];
                        for (const move of learnedMoves) {
                            learnedMoveOptions.push(new StringSelectMenuOptionBuilder().setLabel(move).setValue(move));
                        }


                        const moveSelectMenu = new StringSelectMenuBuilder()
                            .setCustomId('select_move')
                            .setPlaceholder('Select a Move to Train')
                            .addOptions(selectMoveOptions);

                        const learnedMoveSelectMenu = new StringSelectMenuBuilder()
                            .setCustomId('select_learned_move')
                            .setPlaceholder('Select a Move to Forget')
                            .addOptions(learnedMoveOptions);

                        const moveRow = new ActionRowBuilder()
                            .addComponents(
                                moveSelectMenu
                            );
                        const learnedMoveRow = new ActionRowBuilder()
                            .addComponents(
                                learnedMoveSelectMenu
                            );

                        let notifMsg = ""
                        let moveComps = []
                        if (MoveReplace == true) {
                            notifMsg = `***IMPORTANT*** \n Replacing a Move and learning a new one, Select from Below`
                            moveComps = [learnedMoveRow, moveRow]
                        }
                        else {
                            notifMsg = `Learning a New Move, Select from Below`
                            moveComps = [moveRow]
                        }
                        await interaction.editReply({ content: notifMsg, components: moveComps });

                        const trainCollectorMove = interaction.channel.createMessageComponentCollector({
                            filter: (i) => i.user.id === interaction.user.id, // Only collect interactions from the user who sent the command
                            time: 60000, // Set a timeout for interaction (optional)
                        });

                        let selectedMove; // Variable to store selected move
                        let selectedLearnedMove; // Variable to store selected learned move

                        trainCollectorMove.on('collect', async (i) => {
                            i.deferUpdate();
                            if (i.customId === 'select_move') {
                                selectedMove = i.values[0];
                            } else if (i.customId === 'select_learned_move' && MoveReplace == true) {
                                selectedLearnedMove = i.values[0];
                            }

                            console.log(selectedMove, selectedLearnedMove, MoveReplace)

                            if (selectedMove) {
                                // Do Nothing wait for the second response
                            }

                            // Check if both selections are made
                            if (selectedMove && (MoveReplace == false || selectedLearnedMove)){

                                await trainCollectorMove.stop();

                                if (MoveReplace == true && !selectedLearnedMove) {
                                    await i.reply({ content: "Please Select a Move to Forget", ephemeral: true });
                                }
                                else {
                                    const learnResponse = await trainPokemon(selectedPokemon.id, userid, selectedLearnedMove, selectedMove, MoveReplace);
                                    console.log(learnResponse)

                                    await interaction.editReply({
                                        content: learnResponse, // Send the response to the user
                                        components: [] // Remove the menus after selection
                                    });
                                }
                            }
                        });
                    }
                    else if (i.customId === 'levelup_pokemon') {

                        let rareCandyAmount

                        try {
                            const RareCandyModal = new ModalBuilder()
                                .setCustomId('rare_candy_modal')
                                .setTitle('How Many Rare Candies to use')

                            const candyAmount = new TextInputBuilder()
                                .setCustomId('candyamount')
                                .setLabel("amount")
                                .setRequired(true)
                                .setStyle(TextInputStyle.Short);


                            const candyActionRow = new ActionRowBuilder().addComponents(candyAmount);

                            RareCandyModal.addComponents(candyActionRow)

                            await i.showModal(RareCandyModal);

                            // Collect a modal submit interaction
                            const filter = (i) => i.customId === 'rare_candy_modal';

                            const modalVals = await i.awaitModalSubmit({ filter, time: 60_000 }).then(async (modal) => {
                                const modalComp = modal.fields.fields //(candy => candy.customId === 'candyamount');
                                rareCandyAmount = parseInt(modalComp.get('candyamount').value)

                                const res = await levelUpPokemon(selectedPokemon.id, userid, rareCandyAmount);
                                console.log(res)
                                await modal.update(res[0]);

                                user.Items.find(item => item.name.toLowerCase() === "rarecandy").amount -= rareCandyAmount;

                                await UserSchema.findOneAndUpdate({ DiscordID: userid }, { Items: user.Items });

                                const Evolutions = await getEvolutions(selectedPokemon.species.toLowerCase()).catch(error => console.log('getEvolutions errored', error));
                                if (!Evolutions) return console.log("No Evolutions Found");

                                console.log(selectedPokemon.level)

                                if (res[1] > Evolutions.evolvesAt - 1) {
                                    console.log(Evolutions.evolvesToSpecies)
                                    console.log("Evolving Pokemon...")
                                    // change pokemons species
                                    await UserSchema.findOneAndUpdate({ DiscordID: userid, "AllPokemons.id": selectedPokemon.id }, { "AllPokemons.$.species": Evolutions.evolvesToSpecies });
                                    await interaction.editReply({ content: `Pokemon Evolved to ${Evolutions.evolvesToSpecies}`, components: [] });
                                }

                            })

                        }
                        catch (error) {
                            console.log(error)
                        }

                    }
                    else if (i.customId === 'close_interaction') {
                        trainCollector.stop();
                        await interaction.editReply({ content: "Interaction Ended", components: [], embeds: [] });
                    }
                });
            }

        });
        collector.on('end', collected => {
            console.log(`Collected ${collected.size} interaction`)
        })
    }
};
