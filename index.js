const { Client, Intents, Collection, Guild} = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const {getAudioUrl} = require('google-tts-api')
const {joinVoiceChannel,createAudioPlayer,createAudioResource,AudioPlayerStatus,VoiceConnection, entersState} = require('@discordjs/voice');
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
let channels = ['841686942772494397','857626669225738264']
let state = 'idle'
let chat = []
client.on('messageCreate',async msg =>{
  if(!channels.includes(msg.channelId)) return 
  if(state !== 'idle'){
    chat.push(msg.content)
    return
  }
  if(channels.includes(msg.channelId)){ 
    if(msg.author.bot) return 
    if(!msg.member.voice.channelId) return
    if(msg.content.includes('조라')){
      let nick = msg.member.nickname.split(' ')[0]
      msg.content = msg.content.replace(/조라/g,nick)
    }
    if(msg.member.id === '993596981693911050'){
    }
    chat.push(msg.content)
    function repeat(){
      const url = getAudioUrl(chat[0], {
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
        state = 'playing'
      })
      player.on(AudioPlayerStatus.Idle, ()=>{
        state = 'idle'
        chat[0] && repeat()
      })
    }
    repeat() 
  }
})


client.login(token);