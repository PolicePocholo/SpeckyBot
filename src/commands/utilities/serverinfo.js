module.exports = {
    name: "serverinfo",
    description: "Informations about the server you're in!",
    category: "utilities",
    aliases: ["si","serveri"]
}

module.exports.run = async (bot, msg) => {

    let bots = 0;
    let humans = 0;

    msg.guild.members.cache.forEach(member => {
        if(member.user.bot){
            bots++;
        }else{
            humans++;
        }
    });

    const embed = bot.embed()
    .setAuthor(msg.author.username)
    .setDescription("Information about the guild you are in:")
    .setImage(msg.guild.iconURL())
    .addField("Server Name", `${msg.guild.name}`)
    .addField("Server ID", `${msg.guild.id}`)
    .addField("Server Region", `${msg.guild.region}`)
    .addField("System Messages", `${msg.guild.systemChannel}`)
    .addField("Verification Level", `${msg.guild.verificationLevel}`)
    .addField("Owner", `${msg.guild.owner} (${msg.guild.ownerID})`)
    .addField("Total Member Count", `${msg.guild.memberCount}`,true)
    .addField("Human Count", `${humans + "/" + (msg.guild.memberCount - bots)}`,true)
    .addField("Bot Count", `${bots}`,true)
    .addField("Is the server large?", `${msg.guild.large}`)
    .addField("Created at", `${msg.guild.createdAt}`);
    msg.channel.send(embed);
}
