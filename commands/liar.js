const { SlashCommandBuilder, ActionRowBuilder, SelectMenuBuilder,} = require('@discordjs/builders');
const { MessageActionRow, MessageButton,MessageEmbed,Message, MessageSelectMenu } = require('discord.js');
module.exports = {
  participant: ['123','12','13114'] ,
  userName: ['멍청이','똒똒이','바보','듸질래','아하하'] ,
  data: new SlashCommandBuilder()
		.setName('liar')
		.setDescription('liarGameStart') 
    ,
  async execute(interaction){
    if(!interaction.member.voice.channelId) return interaction.reply({content:'채널먼저가자',ephemeral: true})
    let button1 = new MessageButton();
        button1.setCustomId("참가");
        button1.setLabel("넹");
        button1.setStyle("PRIMARY");

    const btnRow = new MessageActionRow().addComponents([button1]);

    let embed = new MessageEmbed().setDescription("참가하십니까?")
    interaction.reply({ embeds: [embed], components: [btnRow] });
    const filter = (interaction) => {
      return interaction.customId === '참가'
    }
    const btnCollector = interaction.channel.createMessageComponentCollector({ filter, time: 5000 });

    btnCollector.on("collect",async(interaction)=>{
      if(interaction.customId === '참가'){
        //중복참가 ㄴㄴ
        if(this.participant.includes(interaction.user.id)) return
        //참가자 내역에 추가
        this.participant.push(interaction.user.id)
        //참가자들 이름
        this.userName.push(interaction.member.nickname ? interaction.member.nickname : interaction.user.username)
        let embed2 = new MessageEmbed().setDescription(`${this.userName.map(e=>{
          return ` ${e} `
        })} 님 참가완료`)
        interaction.update({embeds:[embed2],components:[btnRow]})
      }
        
    })
    let count = 0
    btnCollector.on("end",async(collect)=>{
      //술래정하기
      // if(this.participant.length < 2) return
      let setTagNumber = Math.floor(Math.random() * this.participant.length)
      let setTag = this.participant[setTagNumber]
      //술래를 제외한 나머지
      let remainder = this.participant.filter((item)=>{
        if(setTag !== item) return item
      })
      // 사람이 3명보다 많으면 시작 메세지
      if(this.participant.length < 2 ) return  interaction.channel.send({content:'사람 수가 너무 적습니다.'})  
      interaction.channel.send({content:`${this.userName.map(user=>{
        return `${ user }`
      })}들에게 제시어를 DM으로 제공합니다.`})
      let Word1 = ['헤응','?그게뭔데','나도몰라']
      let Word2 = ['감자','머저리','응가','뭐라니']
      let random = Math.floor(Math.random()*Word1.length)
      let randomWord = Word1[random]
        collect.forEach(click=>{
          if(click.user.id === setTag){
            click.user.send({content:`제시어는:${Word1[random]}`})
          }else{
            click.user.send({content:`제시어는:${Word2[random]}`})
          }
        })
        let timer = new MessageEmbed().setDescription('라이어가 누구인지 투표하세요')
        let userMenu = []
        this.userName.map((user,userIndex)=>{
          userMenu.push(
            {
              label:user,
              value:user
            }
          )
        })
        const row = new MessageActionRow().addComponents(
          new MessageSelectMenu()
          .setCustomId('테스트')
          .setPlaceholder('요기야')
          .addOptions(userMenu)
        )
        
        interaction.channel.send({embeds:[timer],components:[row]}).then((msg)=>{          
        })
    })
    btnCollector.on("collect",async(interaction)=>{
      if(interaction.customId === '힘냅시다'){
        console.log('으음?')
      }
    })
  }
}; 