const { SlashCommandBuilder } = require('@discordjs/builders');
const {joinVoiceChannel,createAudioPlayer,createAudioResource, AudioPlayerStatus, getVoiceConnection} = require('@discordjs/voice')
const {getAudioUrl} = require('google-tts-api')
const {client} = require('../index')
module.exports = {
	data: new SlashCommandBuilder()
		.setName('leave')
		.setDescription('적어라'),  
	async execute(interaction) {
    if(!interaction.member.voice.channelId) return interaction.reply({content:'채널먼저가자',ephemeral: true})
    let connection = getVoiceConnection(interaction.guildId)
    connection && connection.destroy()
    interaction.reply({content:'땃쥐 제거완료'})
	}
};  