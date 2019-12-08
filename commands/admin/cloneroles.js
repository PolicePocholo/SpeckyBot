const Discord = require("discord.js");

module.exports.run = async (bot, msg, args, config) => {
    if(!args[1]){
        msg.channel.send("You have to mention 2 users to clone roles (1st => 2nd)");
        return;
    }

    let q = 0, usrs = [];

    await msg.mentions.users.forEach(user => {
        usrs[q] = user;
        q++
    })

    usrs.reverse()
    
    var memb1;
    var memb2;

    await msg.guild.fetchMember(usrs[0]).then(usr => {memb1 = usr}).catch(e => {})
    await msg.guild.fetchMember(usrs[1]).then(usr => {memb2 = usr}).catch(e => {})

//        msg.channel.send(`Missing permissions or user doesn't exist`); 

    await memb1.roles.forEach(async role => {
        if(!memb2.roles.hasOwnProperty(role)){
            await memb2.addRole(role.id).catch(e => {})
        }
    })

    await memb2.roles.forEach(async role => {
        if(memb1.roles.hasOwnProperty(role)){
            await memb2.removeRole(role.id).catch(e => {})
        }
    })
}

module.exports.config = {
    name: "cloneroles",
	description: "Clones the roles from one user to another one!",
    usage: `<userMention> <userMention>`,
    category: `admin`,
	accessableby: "Server Admins and Moderators",
    aliases: ["cr"],
    perms: ['MANAGE_ROLES']
}