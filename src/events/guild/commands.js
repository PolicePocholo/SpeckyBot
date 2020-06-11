module.exports = {
    event: "message"
}

const { RichEmbed, Collection } = require('discord.js');
const leven = require('leven');
const fetch = require('node-fetch');

module.exports.call = async (bot, msg) => {
    if(msg.author.bot || msg.channel.type === "dm") return;

    if(msg.system) return;

    if(bot.cache.messages.includes(msg.id)){
        return;
    }else{
        bot.cache.messages.push(msg.id);
    }

    if(bot.config.bannedUsers.includes(msg.author.id)){
        return;
    }

    if(!msg.content.toLowerCase().startsWith(bot.config.prefix)){
        if(msg.mentions.users.first() ? msg.mentions.users.first().tag == bot.user.tag : false){
            const clean = `@${msg.guild.me.nickname ? msg.guild.me.nickname : bot.user.username}`;
            if(msg.cleanContent != clean){
                msg.content = msg.cleanContent.replace(clean, bot.config.prefix).trim();
            }else{
                msg.args = [];
                msg.Args = [];
                const help = "help";
                logger(help,true,msg,bot);
                const helpcmd = bot.commands.get(help);
                run(helpcmd, bot, msg, `${bot.config.prefix}${help}`);
            }
        }
    }

    if(!msg.content.toLowerCase().startsWith(bot.config.prefix)) return;

    const flags = msg.content.toLowerCase().match(/--([a-z]+)/g);
    msg.flags = [];
    if(flags){
        flags.forEach((f,index) => {
            msg.flags[index] = flags[index].slice(2);
        })
    }

    msg.hasFlag = (input) => {
        return msg.flags.includes(input.toLowerCase());
    }
    msg.flag = msg.hasFlag;

    msg.content = msg.content.replace(/(\s?--[a-zA-Z]+\s?)+/g,' ').trim();

    msg.Args = msg.content.split(/\s|\n/g);

    let command = msg.Args[0].toLowerCase();

    while(msg.Args[0] == bot.config.prefix && msg.Args.length > 0){
        const fix = msg.Args[0] + msg.Args[1];
        msg.Args[1] = fix;
        command = fix.toLowerCase();
        msg.Args = msg.Args.slice(1);
    }

    msg.Args = msg.Args.slice(1);

    msg.Args = msg.Args.clean();

    msg.args = msg.Args.toLowerCase();
    msg.ARGS = msg.Args.toUpperCase();

    msg.content = msg.content.slice(bot.config.prefix.length).trim().slice(command.length-bot.config.prefix.length).trim();

    if(!msg.content && msg.attachments.size){
        try{
            msg.content = await (await fetch(msg.attachments.filter(v => v.filename.endsWith('.txt')).first().url)).text();
        }catch(e){}
    }

    msg.command = command.slice(bot.config.prefix.length);

    msg.links = (msg.content ? msg.content.match(/^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([-.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/g) : []) || []

    let cmd = bot.getCommand(command.slice(bot.config.prefix.length));
    
    const execute = async () => {
        if(cmd){
            bot.stats.commandsExecuted++;

            msg.bot = bot;
            bot.cache.msg = msg;

            logger(command.slice(bot.config.prefix.length),true,msg,bot);

            if(!msg.guild.me.permissionsIn(msg.channel).has('SEND_MESSAGES')){
                return
            }

            let owner = false;
            let admin = false;
            let illegal = false;

            if(bot.checkOwner(msg.author.id)){
                owner = true
            }
            if(msg.channel.permissionsFor(msg.member).has("ADMINISTRATOR")){
                admin = true
            }

            const errorReasons = [];

            function check(adminAllowed, reason){
                if(owner){
                    illegal = true;
                    errorReasons.push(reason.toString());
                    return false;
                }else if(   adminAllowed &&
                            admin &&
                            (category != "owner" &&
                            category != "private" &&
                            category != "custom")
                ){
                    illegal = true;
                    errorReasons.push(reason);
                    return false;
                }else{
                    return true;
                }
            }

            const ownerError    =  "👮‍♂️ You aren't the bot owner.";
            const botPermError  =  "🚫 Bot doesn't have required permissions.";
            const nsfwError     =  "🔞 This command is only allowed in NSFW channels.";
            const imagesError   =  "🎨 This command requires the `ATTACH FILES` permission.";
            const userPermError =  "🚷 You don't have the required permissions for that command.";
            const serverError   =  "⛔ This command isn't available on this server.";
            const musicError    =  "🎵 Music is broken."

            const category = cmd.category;

            if(category == "images"){
                await bot.setLastImageCache(msg);
            }

            if(category == "economy"){
                await bot.economyRead(bot,msg);
            }

            if((category == "owner" || cmd.category === "private") && !owner){
                return msg.channel.send(error(ownerError))
            }

            if(cmd.cmdperms){
                cmd.cmdperms.forEach(perm => {
                    if(!msg.guild.me.hasPermission(perm)){
                        if(check(false, botPermError)){
                            return msg.channel.send(error(`${botPermError}\nMissing permission: \`${perm}\``))
                        }
                    }
                })
            }
            
            if(category == "nsfw" && ((msg.channel.topic ? msg.channel.topic.toLowerCase().includes('[no-nsfw]') : true) || !msg.channel.nsfw)){
                if(check(true, nsfwError)){
                    return msg.channel.send(error(nsfwError))
                }
            }

            if(category == "images" && !msg.channel.permissionsFor(msg.guild.me).has('ATTACH_FILES')){
                if(check(false, imagesError)){
                    return msg.channel.send(error(imagesError))
                }
            }

            if(category == "music"){
                if(!owner){
                    return msg.channel.send(error(musicError))
                }
            }

            if(!(msg.member.hasPermission(["ADMINISTRATOR"]))){ 
                if(cmd.perms){
                    if(!msg.member.hasPermission(cmd.perms)){
                        if(check(false, userPermError)){
                            return msg.channel.send(error(userPermError))
                        }
                    }
                }
            }

            if(cmd.servers){
                if(cmd.servers.indexOf(msg.guild.id.toString()) < 0){
                    if(check(false, serverError)){
                        return msg.channel.send(error(serverError));
                    }
                }
            }

            if(illegal){
                const time = 10;
                msg.channel.send(error(`⚠️ You are doing something that you shouldn't!\n\n${bot.singPlur(errorReasons.length,"Reason",false)}:\n${errorReasons.join("\n")}\n\nThis message and yours with autodestruct in ${time} seconds if you don't confirm.`))
                .then(async ms => {
                    const emote = '✅';
                    await ms.react(emote);
                    const filter = (reaction, user) => (user.id == msg.author.id) && (reaction.emoji.name == emote)
                    const collector =  ms.createReactionCollector(filter, { time: (time*1000), errors: ['time'] })
                    
                    let runned = false;
                    
                    collector.on('collect', async () => {
                        runned = true;
                        collector.stop();
                        await ms.delete().catch(()=>{});
                        return run(cmd, bot, msg, command);
                    })
                    
                    collector.on('end', async () => {
                        if(runned) return;
                        await ms.delete().catch(()=>{});
                        await msg.delete().catch(()=>{});
                    })
                })
            }else{
                await run(cmd, bot, msg, command);
            }

        }else{
            logger(command.slice(bot.config.prefix.length),false,msg, bot);
            
            if(bot.config.reply_unexisting_command){
                await msg.channel.send(error(`🛑 Command \`${command}\` doesn't exist or isn't loaded correctly.`));
            }
        }
    }

    if(cmd){
        return await execute();
    }else{
        const cmdarray = bot.commands.map(c => c.name).concat(bot.aliases.keyArray());
        let mostlikely = new Collection();
        cmdarray.forEach(item => {
            const numb = leven(msg.command,item);
            mostlikely.set(item,numb);
        })
        mostlikely = mostlikely.sort((a,b) => a-b);
        const items = mostlikely.keyArray().slice(0,9);
        let string = `Command \`${msg.command}\` is unavailable...\nSend a message with the number of the desidered command or \`c\` to cancel.\n\n`;
        items.forEach((val, ind) => string += `\`${ind+1}\` ${val}\n`)
        const ms = await msg.channel.send(bot.embed().setDescription(string));
        const regex = /[1-9cC]/g
        const filter = m => ((m.author.id == msg.author.id) && Boolean(m.content.toLowerCase().match(regex)));
        const collector = msg.channel.createMessageCollector(filter, { time: 15000, errors: ["time"] });
        let runned = false;
        collector.on('collect', async (collected) => {
            const m = collected;
            const numb = m.content.toLowerCase().match(regex)[0];
            await m.delete().catch(()=>{});
            if(isNaN(numb)){
                return collector.stop();
            }
            await ms.delete().catch(()=>{});
            runned = true;
            const com = items[numb-1];
            msg.command = com;
            cmd = bot.commands.get(com) || bot.commands.get(bot.aliases.get(com));
            collector.stop();
            return await execute();
        });
        collector.on('end', async () => {
            if(runned) return;
            await ms.edit(error(`🛑 Command \`${command}\` doesn't exist or isn't loaded correctly.`)).catch(()=>{});
        });
    }
}

async function run(cmd, bot, msg, command){
    if(bot.cache.runningcmds.includes(`${msg.author.id}:${cmd.name}`)){
        return await msg.channel.send(error("This command is already running..."));
    }

    const cd = bot.cache.cooldown.get(`${msg.author.id}:${cmd.name}`);
    if(cd){
        const diff = new Date().getTime() - cd.getTime();
        if(diff < (cmd.cooldown ? cmd.cooldown : 1000)){
            return await msg.channel.send(error("This command is on cooldown..."));
        }
    }

    bot.cache.cooldown.set(`${msg.author.id}:${cmd.name}`,new Date());
    bot.cache.runningcmds.push(`${msg.author.id}:${cmd.name}`);

    bot.getFunction(cmd)(bot, msg)
    .then(async res => {
        if(cmd.type === 'template' && res && typeof res == "string"){
            msg.channel.send(res.trim());
        }
    })
    .catch(async (err) => {
        let expected;
        try{
            expected = err.includes("[EXPECTED]")
        }catch(e){
            expected = false
        }

        if(expected){
            err = err.replace("[EXPECTED]","").trim();
            msg.channel.send(error(err));
        }else{
            bot.log(err.message||err.error||err);
            await msg.channel.send(error(`🚸 An unexpected error happend at \`${command}\` command.\nIf this error happens frequently, report it to the SpeckyBot creators.`));
            
            if(String(err).includes("Must be 2000 or fewer in length")){
                msg.channel.send(errdesc(`${bot.user} tried to send a message with 2000 or more characters.`));
            }else if(String(err).includes("Request entity too large")){
                msg.channel.send(errdesc(`${bot.user} tried to send an attachment with more than 8MB.`));
            }else{
                msg.channel.send(errdesc(err));
            }
        }
    })
    .finally(async () => {
        bot.cache.cooldown.delete(`${msg.author.id}:${cmd.name}`,new Date());
        bot.cache.runningcmds.remove(`${msg.author.id}:${cmd.name}`);
        if(cmd.category == "economy"){
            await bot.economyWrite(bot.economy);
        }
    })
}

function logger(cmd, actived, msg, bot){
    bot.log(`${cmd.toUpperCase()}: (${actived?"activated":"rejected"}) ${msg.author.tag} (${msg.author.id}, ${msg.channel.id}, ${msg.guild.id})`.cmd)
}

function error(error){
    return new RichEmbed()
    .setTitle('ERROR!')
    .setDescription(error.substr(0,1950))
    .setColor('FF0000')
}

function errdesc(err){
    try{
        err = err.stack ? err.stack.substr(0,1950) : err.substr(0,1950);
    }catch(e){
        err = null;
    }
    return new RichEmbed()
    .setTitle('ERROR DESCRIPTION')
    .setDescription(`${err}\n\nFile: ${err ? err.fileName : undefined}\nLine: ${err ? err.lineNumber : undefined}`)
    .setColor('FF0000')
}
