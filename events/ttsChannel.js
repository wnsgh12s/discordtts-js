const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require("@discordjs/voice")
require('dotenv').config();
const textTospeech = require('@google-cloud/text-to-speech')
const speech = new textTospeech.TextToSpeechClient()
let chatChannel = require('../commands/addChannel')
module.exports = {
  name: 'messageCreate',
  once: false,
  pitch : 1,
  speakingRate : 1,
  async convertTexttoMp3(data,gender,name,pitch,speakingRate){
    if(speakingRate > 4 || speakingRate < 0.25) speakingRate = 1
    if(pitch > 20 || pitch < -20 ) pitch = 1
    const text = data
    const [response] = await speech.synthesizeSpeech({
      input:{text},
      voice:{languageCode:'ko-KR',ssmlGender:gender,name:name},
      audioConfig:{audioEncoding:'MP3',pitch,speakingRate}
    })
    return response.audioContent
  },
  async execute(msg){  
    let channelObj = chatChannel.channelObj
    if(channelObj[msg.channelId] === undefined) return   
    if(msg.author.bot) return 
    let botId = msg.guild.members.cache.get(msg.guild.client.user.id).voice.channelId
    let msgId = msg.member.voice.channelId
    if(botId !== msgId && botId) return msg.channel.send(`${msg.guild.members.cache.get(msg.guild.client.user.id).voice.channel.name} 채널에서 사용중 입니다.`)
    let chat = channelObj[msg.channelId].chat
    if(channelObj[msg.channelId].state !== 'idle') {
      return msg.member && chat.push({content:msg.content,sex: msg.member.roles.cache.some(role=>role.name === '남자')}
      )} 
    if(!msg.member.voice.channelId) return  
    if(msg.content.length > 50) return msg.channel.send('채팅너무길어')
    if(msg.content.includes('피치조절') && !isNaN(parseInt(msg.content.split(' ')[1]))){
      this.pitch = msg.content.split(' ')[1]
    }
    if(msg.content.includes('속도조절') && !isNaN(parseInt(msg.content.split(' ')[1]))){
      this.speakingRate = msg.content.split(' ')[1]
    }
    let convertTexttoMp3 = this.convertTexttoMp3
    chat.push( { content:msg.content,sex: msg.member.roles.cache.some(role=>role.name === '남자')})
    channelObj[msg.channelId].state = 'playing'
    let pitch = this.pitch
    let speakingRate = this.speakingRate
    async function repeat(){
      const connection = joinVoiceChannel({
        channelId: msg.member.voice.channelId,
        guildId: msg.guildId,
        adapterCreator: msg.guild.voiceAdapterCreator
      })
      const player = createAudioPlayer();
      let resource
      if(chat[0].sex){
        resource = createAudioResource(convertTexttoMp3(chat[0]?.content,'FEMALE','ko-KR-Wavenet-D',pitch,speakingRate),{
          inlineVolume: true,
        })
      }else{
        resource = createAudioResource(convertTexttoMp3(chat[0]?.content,'FEMALE','ko-KR-Wavenet-B',pitch,speakingRate),{
          inlineVolume: true
        })
      }
      resource.volume.setVolume(0.7)
      connection.subscribe(player);      
      player.play(resource)

      player.on(AudioPlayerStatus.Playing, ()=>{
        chat.shift()
      })
      player.on(AudioPlayerStatus.Idle, async ()=>{
        await chat[0] && repeat()
        channelObj[msg.channelId].state = 'idle'
      })
    }
    await repeat()
    }
}