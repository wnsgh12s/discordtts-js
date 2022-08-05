const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('node:fs');
require('dotenv').config();
const clientId =process.env.CLIENT_ID
const guildId =process.env.GUILD_ID
const token = process.env.TOKEN


const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));


for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
  console.log(command)
	commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(token);

(async () => {
	// try {
	// 	await rest.put(
	// 		Routes.applicationGuildCommands(clientId, guildId),
	// 		{body: commands},
	// 	);
	// 	console.log('보내기성공');
	// } catch (error) {
	// 	console.error(error);
	// }
  try {
    await rest.put(Routes.applicationCommands(clientId),{ 
      body: commands,
    });
    console.log('글로벌 명령어 등록성공')
  }
  catch (error) {
    console.log(error)
  }
})();