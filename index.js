const Discord = require("discord.js");
const client = new Discord.Client;
var moment = require('moment-timezone');
const config = require("./config.json")
moment().tz("Europe/Paris")
moment.locale("fr")

const users = require("./users.json")



const Database = require("@replit/database")
const db = new Database()

client.once("ready", () => {
  var annC = client.channels.cache.get(config.channelid)

//  db.list().then(keys => {console.log(keys)})
  console.log("Logged as " + client.user.tag + "(" + client.user.id + ")")
  console.log("User to check:" + users.users.length)
  console.log("Starting prossec...")
  
  
  checkUser(annC)
  setInterval(function() { 
    checkUser(annC) // check tout les 15 secondes
    console.log("Checked.") 
  }, 15 * 1000)

})

client.on("message", async (message) => {
  if(message.author.bot)return;
  if(message.member.hasPermission('ADMINISTRATOR')){
  if(message.content === "!stop")return message.reply("Pour arreter le bot, vous devez faire `!stop confirm`\n:warning: Le seul moyen de redemarer le bot serra de depuis le panel ! :warning:")

  else if(message.content === "!stop confirm"){
    await message.reply("Le bot va s'arreter.")
    await console.log("Une demmande d'arret a été demandé par " + message.author.tag + " à " + new moment())
    client.destroy();
  }else if(message.content === "!verify"){
    var annC = client.channels.cache.get(config.channelid); // channel were message will be posted to
  const user = client.users.cache.get(config.userid) // user who will be check
  checkUser(message.channel)
  }
  }
})


require("./server.js")();
client.login(process.env.TOKEN)

function checkUser(channelAnn){
  let time = new moment()
  let users = require("./users.json").users
  users.forEach(userID => {
    const user = client.users.cache.get(userID)
    if(user.presence.status === "idle" || user.presence.status === "online" || user.presence.status === "dnd"){
      
      db.get("user_" + user.id + "_status").then(status => {
        if(status === "online")return;
        
        else{    
          db.set("user_" + user.id + "_status", "online").then(() => {
            db.set("user_"+ user.id +"_lastseen", time).then(() => {})
            console.log("on")
            channelAnn.send({embed: {
              title: user.tag + " c'est connecté !",
            description: "À: " + time.format("h[h]mm [et] SS [secondes le ] MMMM Do YYYY"),
            color: "12B533",
            footer: {
              text: "Si le bot spam de message, vous pouvez faire \"!stop\" pour arreter la verification"
              }
            }});
          });
        }
      });
      
      
  }else if(user.presence.status === "offline"){
    db.get("user_" + user.id + "_status").then(userS => {
      
      if(userS === "offline")return;
      else{
        console.log('off')
        db.set("user_" + user.id + "_status", "offline").then(() => {
          db.get("user_"+ user.id + "_lastseen").then(lastseen => {
            channelAnn.send({embed: {
              author: {
		            name: user.tag,
		            icon_url: user.displayAvatarURL({dynamic:true})
              },
              title: user.tag + " c'est déconecté !",
              description: "À: " + time.format("h[h]mm [et] SS [secondes le ] MMMM Do YYYY") + "\nConnecté pendant :" + moment(lastseen).fromNow(true)
            }})
          db.set("user_" + user.id + "_lastseen")
          })
          
        });
      }
    });
  }
});
}
