const { Client, Intents, Collection} = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
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
const eventsPath = path.join(__dirname,'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file=>file.endsWith('.js'))

for(const file of eventFiles){
  const filePath = path.join(eventsPath,file);
  const event = require(filePath);
  if(event.once) {
    client.once(event.name,(...args)=>event.execute(...args));
  }else{
    client.on(event.name,(...args)=>event.execute(...args))
  }
}

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
client.on('interactionCreate',(interaction)=>{
  console.log(interaction)
})



client.login(token);