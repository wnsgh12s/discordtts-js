const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder } = require('@discordjs/builders');
const {joinVoiceChannel,createAudioPlayer,createAudioResource,} = require('@discordjs/voice');
const fs = require('fs')
const { ButtonStyle } = require('discord-api-types/v10');
const { MessageButton, MessageActionRow, MessageSelectMenu } = require('discord.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('effect')
    .setDescription('여러가지 소리 효과'),
	async execute(interaction) {
    if(!interaction.member.voice.channelId) return interaction.reply({content:'채널먼저가자',ephemeral: true})
    const sounds = []
     fs.readdir("./sounds", (err, files) => {
      if (err) throw err;
      files.forEach((item) => {
        sounds.push({
          label: item,
          value: item
        })
      });
      const row = new MessageActionRow().addComponents(
        new MessageSelectMenu()
        .setCustomId('1')
        .setPlaceholder('사운드 목록.')
        .addOptions(sounds)
      )
      interaction.reply({content:'하이',components:[row]})
    });

    const fillter = (interaction) => {
      return interaction.user.id
    }
    const collector = interaction.channel.createMessageComponentCollector({
      fillter,
      time: 5000
    })

    collector.on('collect',async(i)=>{
      await i.reply({content:'재생',components:[]})
      const player = createAudioPlayer();
      const connection = joinVoiceChannel({
        channelId: interaction.member.voice.channelId,
        guildId: interaction.guildId,
        adapterCreator: interaction.guild.voiceAdapterCreator
      });
      const resorce = createAudioResource(`./sounds/${i.values[0]}`,{
        inlineVolume:true
      })
      resorce.volume.setVolume(0.1)
      connection.subscribe(player);
      player.play(resorce)
    })

    collector.on('end',async(i)=>{
      interaction.editReply({content:'시간만료',components:[]})
    })
	}
};  