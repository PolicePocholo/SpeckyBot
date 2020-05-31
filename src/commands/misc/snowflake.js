module.exports = {
    name: "snowflake",
    description: "Converts an ID into a timestamp!",
    usage: `[ID] [ID]...`,
    category: `misc`,
    accessableby: "Members",
    aliases: ['sf','id']
}

const { RichEmbed, SnowflakeUtil: { deconstruct } } = require('discord.js');

module.exports.run = async (bot, msg) => {
    let lsf, error;

    const prev = [];

    msg.Args.forEach(async arg => {
        const snowflake = arg.split('').filter(c=>"0123456789".includes(c)).join('');

        if(isNaN(snowflake) || !snowflake){
            if(!error){
                error = bot.cmdError(`Snowflake \`${arg}\` is not a valid number`);
            }
        }else{
            const deconstructed = deconstruct(snowflake);
            const timestamp = deconstructed.date;
            const binary = deconstructed.binary;
            const toobig = binary.includes('-') || snowflake.length > 19;

            if(prev.includes(binary)){
                return;
            }else{
                prev.push(binary)
            }

            const timenow = new Date();

            const {sec, min, hrs, day, month, year} = bot.msToVars(timestamp - timenow);

            let skip = false;

            const embed = new RichEmbed()
            .setTitle("Snowflake Timestamp")
            .setColor("#FF00AA");

            if(year == Infinity || toobig){
                skip = true;
                embed.setDescription("The requested Snowflake caused an overflow.");
            }else{
                embed.addField(`${timestamp <= timenow ? "How long ago the snowflake was created" : "Time left for that snowflake"}`,`${bot.singPlur(year,"year")} ${bot.singPlur(month,"month")} ${bot.singPlur(day,"day")} ${bot.singPlur(hrs,"hour")} ${bot.singPlur(min,"minute")} and ${bot.singPlur(sec,"second")}`);
            }

            if(toobig){ // > 9223372036854775807
                skip = true;
                embed.setFooter("Time isn't compatible in ISO8601 fomat...");
            }else{
                embed.setFooter("Date of the snowflake");
                embed.setTimestamp(timestamp);
            }

            if(!skip){
                const item = bot.findSnowflake(snowflake);
                if(item){
                    embed.addField(`Resulting snowflake`,item.toString());
                }
            }

            if(lsf){
                const diff = Math.abs(timestamp-lsf);
                const {sec, min, hrs, day, month, year} = bot.msToVars(diff);
                embed.addField(`Difference from previous snowflake`,`${bot.singPlur(year,"year")} ${bot.singPlur(month,"month")} ${bot.singPlur(day,"day")} ${bot.singPlur(hrs,"hour")} ${bot.singPlur(min,"minute")} and ${bot.singPlur(sec,"second")}`)
            }
            lsf = timestamp;

            await msg.channel.send(embed).catch(()=>{});
        }
    });

    if(error){
        return error;
    }
}
