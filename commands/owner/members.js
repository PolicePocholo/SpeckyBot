const { appendFile, unlink } = require('fs')
const { Attachment } = require('discord.js')

module.exports.run = async (bot, msg, args, config) => {
    let members = [];
    msg.guild.members.forEach(async member => {
        members.push(member.user.id)
    })
    appendFile('./members.txt', members.join('\n'), () => {})
    let att = new Attachment('./members.txt',"members.txt")
    await msg.channel.send(att);
    unlink('./members.txt', () => {})
}

module.exports.config = {
    name: "members",
	description: "Turns all user IDs into a txt file!",
    usage: ``,
    category: `owner`,
	accessableby: "Members",
    aliases: []
}
