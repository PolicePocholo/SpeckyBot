module.exports = async (bot, msg) => {
    const config = require('../../config.json')

    if (!msg.content.toLowerCase().startsWith(config.prefix) || msg.author.bot || msg.channel.type === "dm") return;
    
    let args = msg.content.toLowerCase().split(/\s|\n/g);
    var command = args[0];

    while(args[0] == config.prefix){
        const fix = `${args[0]}${args[1]}`
        args[1] = fix;
        command = fix;
        args = args.slice(1);
    }

    args = args.slice(1);

    let cmd = bot.commands.get(command.slice(config.prefix.length)) || bot.commands.get(bot.aliases.get(command.slice(config.prefix.length)));
    if(cmd){
        console.log(`${command.toUpperCase().slice(config.prefix.length)}: actived by ${msg.author.username} (${msg.author.id}, ${msg.channel.id}, ${msg.guild.id})`);
        
        if(!(msg.author.id === config.owner)){
            
            if(cmd.config.category === "owner" || cmd.config.category === "private"){
                msg.channel.send("You aren't my owner.");
                return;
            }

            if(!(msg.member.hasPermission(["ADMINISTRATOR"]))){ 
                if(cmd.config.perms){
                    if(!msg.member.hasPermission(cmd.config.perms)){return msg.channel.send("You can't use this command!")}
                }
            }

            if(cmd.config.servers){
                if(!cmd.config.servers.includes(msg.guild.id)) return msg.channel.send(`This command isn't avaiable on this server.`);
            }
        }

        try{
            cmd.run(bot, msg, args, config);
        }catch(err){console.log(err)}
    }else{
        console.log(`${command.toUpperCase().slice(config.prefix.length)}: (REJECTED) actived by ${msg.author.username} (${msg.author.id}, ${msg.channel.id}, ${msg.guild.id})`);
        msg.channel.send(`We didn't find the command you were looking for. (${command})`);
    }
}

module.exports.config = {
    event: "message"
}