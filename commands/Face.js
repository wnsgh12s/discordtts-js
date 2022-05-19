
const { SlashCommandBuilder } = require('@discordjs/builders');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('바보')
		.setDescription('응애'),  
	async execute(interaction) {
    interaction.reply('응애')
	}
};