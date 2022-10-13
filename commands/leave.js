const { SlashCommandBuilder } = require('@discordjs/builders');
const {getVoiceConnection} = require('@discordjs/voice')
module.exports = {
	data: new SlashCommandBuilder()
		.setName('leave')
		.setDescription('땃쥐미를 내보냅니다'),  
	async execute(interaction) {
    if(!interaction.member.voice.channelId) return interaction.reply({content:'채널먼저가자',ephemeral: true})
    let connection = getVoiceConnection(interaction.guildId)
    connection && connection.destroy()
    interaction.reply({content:'땃쥐 제거완료'})
    interaction
	}
};  