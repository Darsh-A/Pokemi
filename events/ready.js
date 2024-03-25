const { ActivityType, Events } = require('discord.js');
const mongoose = require('mongoose');
const { config } = require('dotenv');

config()

const mongoURL = process.env.mongoURL;

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {

        console.log(`Ready! Logged in as ${client.user.tag}`);
        client.user.setActivity('Sup', { type: ActivityType.LISTENING });

        console.log("Connecting to MongoDB ...")
        if (mongoURL) {
            await mongoose.connect(mongoURL)
            console.log('Connected to MongoDB');
        }
        else {
            console.log("Failed to Connect to MongoDB")
        }
    },
}