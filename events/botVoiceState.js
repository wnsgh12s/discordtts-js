const { getVoiceConnection } = require("@discordjs/voice");

module.exports = {
	name: 'voiceStateUpdate',
	once: false,
	execute(oldstate,newState) {
		let botID = oldstate.guild.members.cache.get(oldstate.guild.client.user.id).voice.channelId
    let userId = oldstate.channelId
    if(oldstate.channel?.members.size < 2 && botID === userId){
      let connection = getVoiceConnection(oldstate.guild.id)
      oldstate.guild.members.cache.get(oldstate.guild.client.user.id).setNickname('돈땃쥐미')
      connection && connection.destroy()
  }},
};