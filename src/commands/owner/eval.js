module.exports = {
    name: "eval",
    description: "Runs custom code directly from Discord!",
    usage: `<code in js>`,
    category: "owner",
    aliases: ["evaluate"],
}

const { inspect } = require("util");
const i = (c) => inspect(c,{depth:0});

module.exports.run = async (bot, msg) => {
    let evaluated;

    if (!msg.cmdContent) return bot.cmdError("You need to insert valid JavaScript code");

    try{
        if(msg.flag('coffee')){
            evaluated = require('coffeescript')
            .eval(
                msg.cmdContent,
                {
                    sandbox: {bot,msg}
                }
            )
        }else{
            evaluated = i(
                eval(
                    msg.cmdContent
                )
            )
        }
    }catch(e){
        return bot.cmdError(`Error while evaluating.\n\n\`\`\`${e.message}\`\`\``);
    }
    evaluated = typeof evaluated != 'object' ? String(evaluated) : evaluated;
    return msg.channel.send(`${evaluated.length<1980?"```js\n":''}${evaluated}${(evaluated||'').length<1990?"\n```":''}`, { split: '\n' })
}
