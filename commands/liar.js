const { SlashCommandBuilder} = require('@discordjs/builders');
const { createAudioPlayer, createAudioResource, AudioPlayerStatus, joinVoiceChannel } = require('@discordjs/voice');
const { MessageActionRow, MessageButton,MessageEmbed,MessageSelectMenu, Modal, TextInputComponent} = require('discord.js');
const { getAudioUrl, getAudioBase64 } = require('google-tts-api');
module.exports = {
  participant: [],
  userName: [],
  vote : [],
  votedUser : [],
  votedUserName : [],
  member:[],
  state : '',
  data: new SlashCommandBuilder()
		.setName('liar')
		.setDescription('liarGameStart'),
  async execute(interaction){
    
    const connection = joinVoiceChannel({
      channelId: interaction.member.voice.channelId,
      guildId: interaction.guildId,
      adapterCreator: interaction.guild.voiceAdapterCreator
    });

    const player = createAudioPlayer();
    const resource = (chat)=>{      
      const url = getAudioUrl(chat, {
        lang: 'ko-KR', 
        slow: false,
        host: 'https://translate.google.com',
        timeotu:10000
      });
      return createAudioResource(url)
    };
    connection.subscribe(player);
    player.play(resource('라이어 게임에 참가하십니까?'));
    this.state = 'playing'
    player.on(AudioPlayerStatus.Idle,()=>{
      this.state = 'idle'
    })
    let button1 = new MessageButton();
        button1.setCustomId("참가");
        button1.setLabel("참가");
        button1.setStyle("PRIMARY");

    const btnRow = new MessageActionRow().addComponents([button1]);
    let expulsionMessage = new MessageEmbed().setDescription("패배자를 추방시킵니다.")
    let embed = new MessageEmbed().setDescription(`라이어 게임에 참가하십니까?`)
    await interaction.reply({ embeds: [embed], components: [btnRow]}).then(e=>{
      let count = 10
      let couter = setInterval(() => {
      count--
      interaction.editReply({content:`남은시간 ${count}초 참가자:${this.userName.map(((e,i)=>{
        return ` ${e} `
      }))}`,embeds: [embed], components: [btnRow]})
      if(count === 0){
        count = '모집마감'
        interaction.editReply({content:`${count}`})
        clearInterval(couter)
      }
    }, 1000)  
    })
    const filter = (interaction) => {
      return interaction.customId === '참가'
    }
    const btnCollector = interaction.channel.createMessageComponentCollector({ filter, time: 10000 });
    btnCollector.on("collect",async(interaction)=>{
      if(interaction.customId === '참가'){
        //중복참가 ㄴㄴ
        if(this.participant.includes(interaction.user.id)) return
        player.play(resource(`${interaction.member.nickname || interaction.user.username}님 참가`))
        //참가자 내역에 추가
        this.participant.push(interaction.user.id)
        //참가자들 이름
        this.member.push(interaction.member)
        this.userName.push(interaction.member.nickname || interaction.user.username)
        let embed2 = new MessageEmbed().setDescription(`${this.userName.map(e=>{
          return ` ${e} `
        })} 님 참가완료`)
        interaction.update({embeds:[embed2],components:[btnRow]})
      }
        
    })

    btnCollector.on("end",async(collect)=>{
      //술래정하기
      // if(this.participant.length < 2) return
      let setTagNumber = Math.floor(Math.random() * this.participant.length)
      let setTag = this.participant[setTagNumber]
      let setTagName = this.userName[setTagNumber]
      let setTagMember = this.member[setTagNumber]
      console.log(setTagName)
      //술래를 제외한 나머지
      let remainder = this.member.filter((item)=>{
        if(setTagMember !== item) return item
      })
      function remainderKick(){
        remainder.forEach(e=>{
          e.voice.disconnect()
        })
      }
      function setTagKick(){
        setTagMember.voice.disconnect()
      }  
      // 사람이 3명보다 많으면 시작 메세지
      if(this.userName[0] === undefined) return
      // if(this.participant.length < 2 ) return  interaction.channel.send({content:'3명 미만으로는 시작 할 수 없는걸...'})   
      interaction.channel.send({content:`참가자들에게 제시어를 DM 으로 제공합니다.`})
      let Word1 = ['사과','귤','오렌지','감자','당근','마늘','오뎅']
      let Word2 = ['가지','임연수어','고등어','가물치','오이','떡볶이']
      let random = Math.floor(Math.random()*Word1.length)
        collect.forEach(click=>{
          if(click.user.id === setTag){
            click.user.send({content:`당신은 라이어~`})
          }else{
            click.user.send({content:`제시어는:${Word1[random]}`})
          }
        })
        let voteMessage = new MessageEmbed().setDescription('6  0초 동안 라이어가 누구인지 투표하세요')
        let userMenu = []
        let initialization = () =>{
          this.participant = []
          this.userName = []
          this.vote = []
          this.votedUser = []
          this.votedUserName = []
          userMenu = []
        }
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
          .setCustomId(setTagName)
          .setPlaceholder('용의자 목록.')
          .addOptions(userMenu)
        )

        const filter = (interaction) =>{
          return interaction.customId === setTagName
        }
        const selectCollector = interaction.channel.createMessageComponentCollector({filter,time:60000})
        let votedUser = []
        selectCollector.on('collect',async(interaction)=>{
          //참가자가 아니면 못누름
          if(!this.userName.includes(interaction.member.nickname || interaction.user.username)) return interaction.channel.send({content:'게임 참가자가 아닙니다.'})
          //투표했으면 못함
          if(this.votedUser.includes(interaction.member.nickname || interaction.user.username)) return interaction.channel.send({content:`${ interaction.member.nickname || interaction.user.username} 님은 이미 투표 하셧습니다.`})
          votedUser.push(interaction.member.nickname || interaction.user.username)
          console.log(votedUser.length,this.userName.length)
          if(votedUser.length === this.userName.length) {
            selectCollector._timeout._onTimeout()
          }
          this.votedUser.push(interaction.member.nickname || interaction.user.nickname)
          interaction.reply({content:`${interaction.member.nickname || interaction.user.username} 투표완료`})
          
        })

        selectCollector.on('end',async(collect)=>{
          //투표가 끝나면 
          collect.forEach(click=>{
            this.vote.push(...click.values)
          })
          const result = {};
          if(this.vote[0] === undefined){
            initialization()
            remainderKick()
            return interaction.channel.send({content:'투표자가 없어서 라이어 승리~',embeds:[expulsionMessage]})
          }
          this.vote.forEach((x) => { 
            result[x] = (result[x] || 0)+1; 
          });
          let 투표된사람 = Object.keys(result).reduce(function(a, b){
            if(result[a] > result[b]){
              return a
            }else if (result[a] < result[b]){
              return b
            }else{
             return '무승부' 
            }
          })
          
          if(투표된사람 === setTagName){
            interaction.channel.send({content:`투표가 끝났습니다. 플레이어가 뽑은 라이어는 ${투표된사람} 이고 ${투표된사람}는  라이어가 맞습니다`})
            interaction.channel.send({content:'라이어에게는 제시어를 맞출 기회를 드리고 정답 일 시 승리합니다.'})
            player.play(resource(`투표가 가장 많이 된 플레이어 ${ 투표된사람 } 는 라이어가 맞습니다. 라이어는 제시어를 맞춰주세요`))
            let buttons = []
            let same = []
                for(let i = 0 ; i < 4 ; i++){
                  let randomBtn = Math.floor(Math.random() * Word1.length)
                  if(same.includes(Word1[randomBtn])){
                    i--
                  }else if(Word1[randomBtn] === Word1[random]){
                    i--
                  }else{
                    same.push(Word1[randomBtn])
                    let button = new MessageButton();
                    button.setCustomId(Word1[randomBtn]);
                    button.setLabel(Word1[randomBtn]);
                    button.setStyle("DANGER");
                    buttons.push(button)
                  }
                }
                same = []
                console.log(Word1[random],setTagName)
                let answer = new MessageButton(0);
                  answer.setCustomId(Word1[random]);
                  answer.setLabel(Word1[random]);
                  answer.setStyle("DANGER");
                  buttons.splice(Math.floor(Math.random()*buttons.length), 0, answer);
                const answerRow = new MessageActionRow().addComponents([buttons]);
                interaction.channel.send({components:[answerRow]})
                buttons = []
                const filter = (interaction) => {
                  if(interaction.customId === '참가') return
                  return interaction.customId 
                }
                const btn2Collector = interaction.channel.createMessageComponentCollector({ filter, time: 20000 });
                let liarResponse = []
                btn2Collector.on('collect',async interaction=>{
                  let name = interaction.member.nickname ? interaction.member.nickname : interaction.user.username
                  if(name !== setTagName) return interaction.reply({content:'당신은 라이어가 아닙니다.',ephemeral: true})
                  liarResponse.push(name)
                  if(interaction.customId === Word1[random]){
                    interaction.reply({content:'-----정답------', embeds:[expulsionMessage]}).then((msg)=>{
                    player.play(resource('라이어가 정답을 맞췄습니다.'))
                    initialization()
                    remainderKick()
                  })
                }else{
                  initialization()
                  interaction.reply({content:'틀렸습니다!!',embeds:[expulsionMessage]})
                  player.play(resource('라이어가 제시어를 틀렸습니다.!!'))
                    setTagKick()
                  }
                })
                btn2Collector.on('end',async collect=>{
                  if(liarResponse[0] === undefined){
                    interaction.channel.send({content:'제한시간안에 라이어가 제시어를 고르지 못해 플레이어가 승리합니다!'})
                    setTagKick()
                  }
                  liarResponse=[]
                  initialization()
                })
                
            
          }else if(투표된사람 === '무승부'){  
            interaction.channel.send({content:`투표가 무승부로 끝나 라이어 ${setTagName}가 승리합니다`,embeds:[expulsionMessage] })
            player.play(resource('투표가 동표로 라이어가 승리합니다'))
            remainderKick()
            initialization()
          }else{
            interaction.channel.send({content:`투표가 끝났습니다 플레이어가 뽑은 라이어는 ${투표된사람} 이고 ${투표된사람}는  라이어가 아니기 때문에 ${setTagName}이 승리합니다.`,embed:[expulsionMessage] })
            player.play(resource('라이어를 고르지 못했기 때문에 라이어가 승리합니다.'))
            remainderKick()
            initialization()
          }          

        })
        
        
          await interaction.channel.send({embeds:[voteMessage],components:[row]}).then(msg=>{
            player.play(resource('60초 동안 라이어가 누구인지 토론 후 투표하세요'))
            let count = 60
            let counter = setInterval(() => {
              count--
              msg.edit({content:`${count}초 남음`})
              if(count <= 0 ){
                msg.edit({content:`투표 마감`})
                clearInterval(counter)
              }
            }, 1000);
          })
        
          
    })
  }
}; 