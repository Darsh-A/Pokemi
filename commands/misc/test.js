const { SlashCommandBuilder } = require('discord.js');
require('dotenv').config();

const vision = require('@google-cloud/vision');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('test')
        .setDescription('what does the command do'),

    async execute(interaction) {

        // Replace 'path/to/your/image.png' with the actual path to your QR code image
        const fileName = 'qr.png';

        const client = new vision.ImageAnnotatorClient();

        const result = await client.textDetection(fileName);
        console.log(result);
        console.log(result[0].fullTextAnnotation);
        console.log(result[0].textAnnotations);
    }
}