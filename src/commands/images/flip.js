module.exports = {
    name: "flip",
    description: "Flips the image! (Horizontally)",
    usage: ``,
    category: `images`,
    accessableby: "Members",
    aliases: [],
    perms: [],
    cmdperms: []
}

const { read } = require('jimp')
const { unlink } = require('fs')

module.exports.run = async (bot, msg) => {
    const image    = bot.cache.lastImage[msg.channel.id]; 
    const id       = bot.snowflake();

    const fileFormat = "png"
    const method = "flip"
    
    if(image == undefined){
        return msg.channel.send("No image found");
    }

    msg.channel.send("Image is getting processed...").then( response => {

        read(image, (err, file) => {
            if (err){
                return msg.channel.send("Error happend")
            }

            file[method](true, false).write(id + `.${fileFormat}`, ()=>{
                msg.channel.send( '',  { files: [id + `.${fileFormat}`] }).then((ree)=>{
                    response.delete();
                    unlink("./" + id + `.${fileFormat}`, () => {})
                    bot.cache.lastImage[msg.channel.id] = ree.attachments.first().proxyURL;
                })
            })
        })
    })
}
