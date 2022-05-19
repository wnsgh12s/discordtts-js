const { Client, Intents, Collection, Guild } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();
const clientId =process.env.CLIENT_ID
const guildId =process.env.GUILD_ID
const token = process.env.TOKEN

const client = new Client({ intents: [Intents.FLAGS.GUILDS,Intents.FLAGS.GUILD_VOICE_STATES] });

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
    var channel = client.channels.cache.get(interaction.channelId)
    channel.send(`[${interaction.options.data[0].value}] 라고 했다`)
    console.log(token,clientId,guildId)
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}

 
});

client.login(token);