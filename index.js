const { Client, Intents, Collection, Guild} = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const {getAudioUrl} = require('google-tts-api')
const {joinVoiceChannel,createAudioPlayer,createAudioResource,AudioPlayerStatus,VoiceConnection, entersState, getVoiceConnection} = require('@discordjs/voice');
const { channel } = require('node:diagnostics_channel');
const { ModalBuilder } = require('@discordjs/builders');
require('dotenv').config();
const token = process.env.TOKEN

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
    const channel = client.channels.cache.get(interaction.channelId)
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: '에러떳다', ephemeral: true });
	}

});
let channelObj = {
  '841686942772494397':{
    chat : [],
    state : 'idle'
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
client.on('messageCreate',async msg =>{
  if(channelObj[msg.channelId] === undefined) return   
  let botId = msg.guild.members.cache.get(client.user.id).voice.channelId
  let msgId = msg.member.voice.channelId
  if(botId !== msgId && botId) return msg.channel.send(`${msg.guild.members.cache.get(client.user.id).voice.channel.name} 채널에서 사용중 입니다.`)
  let chat = channelObj[msg.channelId].chat
  if(channelObj[msg.channelId].state !== 'idle') return chat.push({content:msg.content,user:msg.member.nickname.split(' ')[0]}) 
  if(msg.author.bot) return 
  if(!msg.member.voice.channelId) return 
  if(msg.content.includes('조라')){
    let nick = msg.member.nickname.split(' ')[0]
    msg.content = msg.content.replace(/조라/g,nick)
  } 
  chat.push( { content:msg.content, user: msg.member.nickname.split(' ')[0]})
  channelObj[msg.channelId].state = 'playing'
  async function repeat(){
    msg.guild.members.cache.get(client.user.id).setNickname(`땃지:${chat[0]?.user}의 말`)
    const url = getAudioUrl(chat[0]?.content, {
      lang: 'ko',
      slow: false,
      host: 'https://translate.google.com',
      timeout:10000
    }); 
    const connection = joinVoiceChannel({
      channelId: msg.member.voice.channelId,
      guildId: msg.guildId,
      adapterCreator: msg.guild.voiceAdapterCreator
    })
    const player = createAudioPlayer();
    const resource = createAudioResource(url);
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
  if(oldstate.channel?.members.size < 2){
    const connection = getVoiceConnection(oldstate.channel.guild.id)
    await oldstate.guild.members.cache.get(client.user.id).setNickname('돈땃쥐미')
    connection && connection.destroy()
  }
})

client.login(token);