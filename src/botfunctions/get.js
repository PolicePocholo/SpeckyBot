module.exports = (bot) => {
    bot.getUser = (input, guild) => {
        let us;

        us = guild.members.cache.find( item => {
            try{
                return item.user.username.toLowerCase() === input.toLowerCase()
            }catch(err){
                return null
            }
        })

        if( us != null && typeof us != undefined) {
            return us.user
        }

        us = guild.members.cache.get(input);

        if(typeof us != undefined && typeof us != undefined){
            return us.user
        }

        return input;
    }

    bot.getMember = (input, guild) => {
        let mmb;

        mmb = guild.members.cache.find( item => {
            try{
                return item.user.username.toLowerCase() === input.toLowerCase()
            }catch(err){
                return null
            }
        })

        if( mmb != null && typeof mmb != undefined) {
            return mmb
        }

        mmb = guild.members.cache.get(input);

        if(typeof mmb != undefined && typeof mmb != undefined){
            return mmb
        }

        return input;
    }

    bot.getChannel = (input, guild) => {
        let ch;

        ch = guild.channels.cache.find( item => {
            try{
                return item.name.toLowerCase() === input.toLowerCase()
            }catch(err){
                return null
            }
        })

        if( ch != null && typeof ch != undefined) {
            return ch
        }

        ch = guild.channels.cache.get(input);

        if(typeof ch != undefined && typeof ch != undefined){
            return ch
        }

        return input;
    }

    bot.getCommand = (command) => {
        return bot.commands.get(command) || bot.commands.get(bot.aliases.get(command));
    }

    bot.getConsoleCommand = (command) => {
        return bot.console.get(command) || bot.console.get(bot.consoleali.get(command));
    }

    bot.getFunction = (cmd) => {
        return (typeof cmd == 'object') ? cmd[Object.keys(cmd).filter(v => typeof cmd[v] == 'function')[0]] : async ()=>{};
    }
}
