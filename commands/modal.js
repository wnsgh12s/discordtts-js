const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, ActionRowBuilder } = require("@discordjs/builders");
const { TextInputStyle } = require("discord-api-types/v10");
const { Modal } = require("discord.js");
module.exports = {
	data: new SlashCommandBuilder()
		.setName('모달창테스트')
		.setDescription('가보자'),  

	async execute(interaction) {
    const modal = new ModalBuilder()
      .setCustomId('테스트')
      .setTitle('모달')      
    const input = new TextInputBuilder()
      .setCustomId('100')
      .setLabel('AGE')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('하이')
    const row = new ActionRowBuilder().addComponents(input)
    modal.addComponents(row)
    try{
      await interaction.showModal(modal)
      console.log('성공')
    }catch(err){
      console.log(err)
      console.log(modal)
    }
    interaction.reply({content:'안대',ephemeral:true})

	}
};  