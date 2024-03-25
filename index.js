// Require the necessary discord.js classes
const { token } = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const events = require('events');
const { io } = require('socket.io-client'); // Socket.io client

/*
 ⭐ Add Intents Here
 */
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

client.emit('verifyPokemon');

// Command Handler
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

// Events Handler
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

const UserSchema = require('./mongo/Schemas/user');
const { Pokemon, checkPokemonExists, filterMovesByGen, getAbility, checkMovesForScratchOrTackle, getSprites } = require('./Utils/UtilityClasses');
const { giveShiny } = require('./Utils/miscFunc.js');

client.emit('verifyPokemon');


// Log in to Discord with your client's token
client.login(token);

