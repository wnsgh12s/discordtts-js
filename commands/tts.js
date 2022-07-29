const { Client, Intents, Collection, Guild, Interaction } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const {joinVoiceChannel,createAudioPlayer,createAudioResource} = require('@discordjs/voice')
const {getAudioUrl} = require('google-tts-api')
const client = new Client({ intents: [Intents.FLAGS.GUILDS,Intents.FLAGS.GUILD_VOICE_STATES] });
module.exports = {
	data: new SlashCommandBuilder()
		.setName('t')
		.setDescription('적어라')
    .addStringOption(option => option
      .setName("chat")
      .setDescription("하하")
      .setRequired(true)),  
	async execute(interaction) {
    if(!interaction.member.voice.channelId) return interaction.reply({content:'채널먼저가자',ephemeral: true})
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
    interaction.reply(`${interaction.member.nickname} 🗣 :`)
	}
};  