const { SlashCommandBuilder } = require('@discordjs/builders');
const {joinVoiceChannel,createAudioPlayer,createAudioResource, AudioPlayerStatus} = require('@discordjs/voice')
const {getAudioUrl} = require('google-tts-api')
module.exports = {
  state : 'idle',
	data: new SlashCommandBuilder()
		.setName('text')
		.setDescription('적어라') 
    .addStringOption(option => option
      .setName("chat")
      .setDescription("하하")
      .setRequired(true)),  
	async execute(interaction) {
    if(!interaction.member.voice.channelId) return interaction.reply({content:'채널먼저가자',ephemeral: true})
    if(this.state !== 'idle') return interaction.reply({content:'말중이잖아',ephemeral: true})
    let voiceData = interaction.options.data[0].value
    const url = getAudioUrl(voiceData, {
      lang: 'ko',
      slow: false,
      host: 'https://translate.google.com',
      timeotu:10000
    });
    const connection = joinVoiceChannel({
      channelId: interaction.member.voice.channelId,
      guildId: interaction.guildId,
      adapterCreator: interaction.guild.voiceAdapterCreator
    });

    const player = createAudioPlayer();
    const resource = createAudioResource(url);
    connection.subscribe(player);
    player.play(resource);
    this.state = 'playing'
    player.on(AudioPlayerStatus.Idle,()=>{
      this.state = 'idle'
    })
    interaction.reply(`돈땃지미`)
	}
};  