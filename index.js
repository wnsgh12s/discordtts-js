const { Client, Intents, Collection, Guild} = require('discord.js');
const textTospeech = require('@google-cloud/text-to-speech')
const fs = require('node:fs');
const path = require('node:path');
const {getAudioUrl} = require('google-tts-api')
const {joinVoiceChannel,createAudioPlayer,createAudioResource,AudioPlayerStatus,VoiceConnection, entersState, getVoiceConnection} = require('@discordjs/voice');
const { channel } = require('node:diagnostics_channel');
const { ModalBuilder } = require('@discordjs/builders');
require('dotenv').config();
const token = process.env.TOKEN
const speech = new textTospeech.TextToSpeechClient()

async function convertTexttoMp3(data,gender,name,pitch,speakingRate){
  if(speakingRate > 4 || speakingRate < 0.25) speakingRate = 1
  if(pitch > 20 || pitch < -20 ) pitch = 1
  const text = data
  const [response] = await speech.synthesizeSpeech({
    input:{text},
    voice:{languageCode:'ko-KR',ssmlGender:gender,name:name},
    audioConfig:{audioEncoding:'MP3',pitch,speakingRate}
  })
  return response.audioContent
}

const client = new Client({ intents: [Intents.FLAGS.GUILDS,Intents.FLAGS.GUILD_VOICE_STATES,Intents.FLAGS.GUILD_MESSAGES] });

client.commands = new Collection()

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	client.commands.set(command.data.name, command);
}

client.on('ready', () => {
  console.log(`로그인했다 ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;
  
  const command = client.commands.get(interaction.commandName);

	if (!command) return;
	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: '에러떳다', ephemeral: true });
	}

});
let channelObj = {
  '841686942772494397':{
    chat : [],
    state : 'idle',
    user:[]
  },
  '857626669225738264':{
    chat : [],
    state : 'idle'
  },
  '402390441300983810':{
    chat : [],
    state : 'idle'
  }
}
let pitch = 1
let speakingRate = 1
client.on('messageCreate',async msg =>{
  if(channelObj[msg.channelId] === undefined) return   
  if(msg.author.bot) return 
  let botId = msg.guild.members.cache.get(client.user.id).voice.channelId
  let msgId = msg.member.voice.channelId
  if(botId !== msgId && botId) return msg.channel.send(`${msg.guild.members.cache.get(client.user.id).voice.channel.name} 채널에서 사용중 입니다.`)
  let chat = channelObj[msg.channelId].chat
  if(channelObj[msg.channelId].state !== 'idle') return msg.member && chat.push({content:msg.content,user : msg.member.nickname.split(' ')[0],sex: msg.member.roles.cache.some(role=>role.name === '남자')}) 
  if(!msg.member.voice.channelId) return  
  if(msg.content.length > 50) return msg.channel.send('채팅너무길어')
  if(msg.content.includes('피치조절') && !isNaN(parseInt(msg.content.split(' ')[1]))){
    pitch = msg.content.split(' ')[1]
  }
  if(msg.content.includes('속도조절') && !isNaN(parseInt(msg.content.split(' ')[1]))){
    speakingRate = msg.content.split(' ')[1]
  }
  chat.push( { content:msg.content, user: msg.member.nickname.split(' ')[0],sex: msg.member.roles.cache.some(role=>role.name === '남자')})
  channelObj[msg.channelId].state = 'playing'
  async function repeat(){
    // const url = getAudioUrl(chat[0]?.content, {
    //   lang: 'ko',
    //   slow: false,
    //   host: 'https://translate.google.com',
    //   timeout:10000
    // }); 
    const connection = joinVoiceChannel({
      channelId: msg.member.voice.channelId,
      guildId: msg.guildId,
      adapterCreator: msg.guild.voiceAdapterCreator
    })
    const player = createAudioPlayer();
    let resource
    if(chat[0].sex){
      resource = createAudioResource(convertTexttoMp3(chat[0]?.content,'FEMALE','ko-KR-Wavenet-D',pitch,speakingRate),{
        inlineVolume: true
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
})

client.on('voiceStateUpdate',async (oldstate,newState)=>{
  let botID = oldstate.guild.members.cache.get(client.user.id).voice.channelId
  let userId = oldstate.channelId
  if(oldstate.channel?.members.size < 2 && botID === userId){
    let connection = getVoiceConnection(oldstate.guild.id)
    oldstate.guild.members.cache.get(client.user.id).setNickname('돈땃쥐미')
    connection && connection.destroy()
  }
})
client.on('messageCreate',(msg)=>{
  function createRole(sex){
    let role = msg.member.guild.roles.cache.find(role=>role.name === sex)
    return role
  }
  if(msg.channelId !== '873862878959108106') return 
  if(msg.guild.ownerId === msg.author.id) return msg.reply({content:'방장은 사용 못합니다.',ephemeral:true})
  if(msg.author.bot) return
  let 양식 = msg.content.split(' ')
  let 성별 = ['남자','여자','남','여','지인']
  if(
    msg.member.roles.cache.some(e=>e.name ==='남자') 
    || msg.member.roles.cache.some(e=>e.name ==='여자')
    || msg.member.roles.cache.some(e=>e.name ==='지인')
    || msg.member.roles.cache.some(e=>e.name ==='관리자')
    ) return msg.reply({content:'이미 역할을 소지하고 있습니다.', ephemeral:true})
  if(양식.length !== 3) return msg.reply('양식 예시: 홍길동 23 남 or 아무개 25 여')
  if(isNaN(parseInt(양식[1]))) return msg.reply('양식의 나이 칸이 올바르지 않습니다 본인의 나이를 적어주세요, 예시 : 홍길동 23 남')
  if(!성별.includes(양식[2])) return msg.reply('양식의 성별 칸이 올바르지 않습니다 남 또는 여로 바꿔주세요, 예시 : 홍길동 23 남')
  if(양식[2].includes('남'||'남자' && msg.guild.roles.cache.some(e=>e.name ==='남자'))){
    msg.member.roles.add(createRole('남자'))
  }else if(양식[2].includes('여'||'여자') && msg.guild.roles.cache.some(e=>e.name ==='여자')){
    msg.member.roles.add(createRole('여자'))
  }else if(msg.guild.roles.cache.some(e=>e.name ==='지인')){
    msg.member.roles.add(createRole('지인'))
  }
  양식.pop()
  let 닉네임 = 양식.join().replace(/,/g , " ")  
  msg.member.setNickname(닉네임).then(()=>{
    msg.reply('권한이 주어졌습니다. 앞으로 잘 부탁드립니다')
    msg.react('💋')
  })

  

})

client.login(token);