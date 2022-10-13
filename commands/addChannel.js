const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageActionRow, MessageSelectMenu } = require("discord.js");
module.exports = {
	data: new SlashCommandBuilder()
		.setName('채팅채널추가')
    .setDescription('채널추가'),
  channelObj : {
    '841686942772494397':{
      chat : [],
      state : 'idle',
    },
    '857626669225738264':{
      chat : [],
      state : 'idle'
    },
    '402390441300983810':{
      chat : [],
      state : 'idle'
    }
  },
	async execute(interaction) {
    if(!interaction.member.voice.channelId) return interaction.reply({content:'채널먼저가자',ephemeral: true})
    let category = [
      {
        label: '추가',
        value: '추가'
      },
      {
        label: '삭제',
        value: '삭제'
      }
    ]
    const row = new MessageActionRow().addComponents(
      new MessageSelectMenu()
      .setCustomId('1')
      .setPlaceholder('카테고리')
      .addOptions(category)
    )

    const fillter = (interaction) => {
      return interaction.user.id
    }

    const collector = interaction.channel.createMessageComponentCollector({
      fillter,
      time: 5000
    })
    interaction.reply({content:'채널이 추가중입니다',components:[row]})

    collector.on('collect',async(i)=>{
      switch(i.values[0]){
        case '추가':{
          this.channelObj[interaction.channelId] = {
            chat : [],
            state : 'idle'
          }
        }
        break
        case '삭제':{
          delete this.channelObj[interaction.channelId]
        }
      } 
      i.reply({content:'완료',ephemeral:true})  
    })
    collector.on('collect',async(i)=>{
      interaction.editReply({content:'시간만료' ,ephemeral:true})  
    })
	}
};  