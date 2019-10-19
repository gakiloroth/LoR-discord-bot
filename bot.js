const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config.json');
const LoRAPI = require('./api-wrapper.js');
const lorapi = new LoRAPI(config.riotAPIKey);

var redownloadJSON = false;

// command line arguments
if(process.argv[2] === 'true'){
  redownloadJSON = true;
}

var core_package_url = 'https://dd.b.pvp.net/datadragon-core-en_us.zip';
var set_bundle_full_url = 'https://dd.b.pvp.net/datadragon-set1-en_us.zip';

var AdmZip = require('adm-zip');
var request = require('request');

// if you pass in command line argument to redownload json files
if(redownloadJSON){
  request.get({url: core_package_url, encoding: null}, (err, res, body) => {
    var zip = new AdmZip(body);

    zip.extractAllTo("data/core-en-us");
    console.log('retrieved core package');

  });

  request.get({url: set_bundle_full_url, encoding: null}, (err, res, body) => {
    var zip = new AdmZip(body);

    zip.extractAllTo("data/set-full");
    console.log('retrieved set full package');

  });
}

// load jsons after download
const globals = require(config.globals);
const set = require(config.set);
const regionIcons = config.regionIcons;
const cardArt = config.cardArt;

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setPresence({
        game: {
            name: 'testing',
            type: 'STREAMING',
            url: 'https://www.twitch.tv/gakiloroth'
        },
        status: 'online'
    })
});

client.on('message', message => {
  // Exit and stop if it's not there and prevent bots from triggering each other
  if (!message.content.startsWith(config.prefix) || message.author.bot) {
    return;
  }

  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  // Restrict a command to a specific user by ID
  if (command === 'dbm') {
  //if (message.content.startsWith(config.prefix + 'dbm')) {
      if (message.author.id !== config.ownerID){
        return;
      }
      message.channel.send("Hecc DBM!");
  }

  // author Reinforcements
  if (command === 'author'){
    message.channel.send("https://www.github.com/gakiloroth");
  }

  // help
  if (command === 'help'){
    const embed = new Discord.RichEmbed()
      .setTitle("Commands")
      .setAuthor(client.user.username, client.user.avatarURL)
      .setColor(0x1c60ff)
      .setDescription(
        "`" + config.prefix + "author`\n" +
        "`" + config.prefix + "keyword`\n" +
        "`" + config.prefix + "region`\n" +
        "`" + config.prefix + "cardname`\n" +
        "`" + config.prefix + "cardid`\n" +
        "`" + config.prefix + "deck`\n" +
        "`" + config.prefix + "currentgame`\n" +
        "`" + config.prefix + "lastgame`\n"
      )
      .setFooter("Commands are case insensitive. For requests/issues or more help go to my github: https://www.github.com/gakiloroth/LoR-discord-bot")

      message.channel.send({embed});
  }

  // get card info
  if(command === "keyword"){
    let[myKeyword] = args;

    var currKeywords = globals.keywords;
    var currWord = null;

    for(let i = 0; i < currKeywords.length; i++) {
      if(currKeywords[i].nameRef.toLowerCase().replace(/\s/g, '') === myKeyword){
        currWord = currKeywords[i];
      }
    }

    if(currWord === null){
      message.channel.send("No matching keyword found!");
      return;
    }

    const embed = new Discord.RichEmbed()
      .setTitle(currWord.name)
      .setAuthor(client.user.username, client.user.avatarURL)
      .setColor(0x1c60ff)
      .setDescription(currWord.description)

      message.channel.send({embed});
    }

    // get region info
    if(command === "region"){
      let[myRegion] = args;

      var currRegions = globals.regions;
      var currRegion = null;

      for(let i = 0; i < currRegions.length; i++) {
        if(currRegions[i].nameRef.toLowerCase().replace(/\s/g, '') === myRegion){
          currRegion = currRegions[i];
        }
      }

      if(currRegion === null){
        message.channel.send("No matching region found!");
        return;
      }

      var attachment;
      // TEMPORARY FIX FOR NEUTRAL and ALL
      if(currRegion.nameRef.toLowerCase() === 'neutral'){
        attachment = new Discord.Attachment(regionIcons + 'icon-all' + '.png', 'icon.png');
      }
      else{
        attachment = new Discord.Attachment(regionIcons + 'icon-' +
          currRegion.nameRef.toLowerCase() + '.png', 'icon.png');
      }

      const embed = new Discord.RichEmbed()
        .setTitle(currRegion.name)
        .setAuthor(client.user.username, client.user.avatarURL)
        .setColor(0x1c60ff)
        .attachFile(attachment)
        .setThumbnail('attachment://icon.png')

        message.channel.send({embed});
    }

    // get card by name
    if(command === "cardname"){
      const myCardName = message.content.slice(config.prefix.length + command.length)
      .trim()
      .toLowerCase()
      .replace("[^a-zA-Z0-9]", "") // remove special characters
      .replace(/\s/g, '');

      console.log(myCardName);

      var currCard = null;

      for(let i = 0; i < set.length; i++) {
        if(set[i].name.toLowerCase().replace("[^a-zA-Z0-9]", "").replace(/\s/g, '') === myCardName){
          currCard = set[i];
        }
      }

      if(currCard === null){
        message.channel.send("No matching card found!");
        return;
      }

      const artAttach = new Discord.Attachment(cardArt + currCard.cardCode + '.png', 'art.png');
      var regionAttach;

      // TEMPORARY FIX FOR NEUTRAL and ALL
      if(currCard.regionRef.toLowerCase() === 'neutral'){
        regionAttach = new Discord.Attachment(regionIcons + 'icon-all' + '.png', 'icon.png');
      }
      else{
        regionAttach = new Discord.Attachment(regionIcons + 'icon-' +
          currCard.regionRef.toLowerCase() + '.png', 'icon.png');
      }

      const embed = new Discord.RichEmbed()
        .setDescription('**Description:** ' + currCard.descriptionRaw)
        .setAuthor(client.user.username, client.user.avatarURL)
        .setColor(0x1c60ff)
        .attachFiles([artAttach, regionAttach])
        .setImage('attachment://art.png')
        .setThumbnail('attachment://icon.png')
        .setFooter(currCard.flavorText + '    |  Artist: ' + currCard.artistName)

        //get related cards
        var associatedCards = currCard.associatedCardRefs;
        var associatedCardsString = "";
        for(let i = 0; i < associatedCards.length; i++){
          function findCard(card){
            return card.cardCode === associatedCards[i];
          }

          var foundCard = set.find(findCard);

          if(i == associatedCards.length - 1){
            associatedCardsString += foundCard.name + " (" + foundCard.cardCode + ")";
            break;
          }
          associatedCardsString += foundCard.name + " (" + foundCard.cardCode + "), ";
        }

        // detail in title if card is collectible
        if(currCard.collectible === true){
          embed.setTitle(currCard.name + ' (Collectible)');
        }
        else{
          embed.setTitle(currCard.name);
        }

        // access different data depenidng on card type
        if(currCard.type === 'Spell'){
          embed.addField("**Details** ",
          "**Cost: ** " + currCard.cost + "\n" +
          "**Type: ** " + currCard.spellSpeed + " Spell\n" +
          "**Rarity: ** " + currCard.rarity + "\n" +
          "**Region: ** " + currCard.region + "\n" +
          "**ID: ** " + currCard.cardCode + "\n" +
          "**Related Cards: ** " + associatedCardsString + "\n"
          ,false);
        }

        if(currCard.type === 'Unit'){
          embed.addField("**Details** ",
          "**Cost: ** " + currCard.cost + "\n" +
          "**Attack: ** " + currCard.attack + "\n" +
          "**Health: ** " + currCard.health + "\n" +
          "**Keywords: ** " + currCard.keywords + "\n" +
          "**Type: ** " + currCard.supertype + " "+ currCard.type + "\n" +
          "**Rarity: ** " + currCard.rarity + "\n" +
          "**Region: ** " + currCard.region + "\n" +
          "**ID: ** " + currCard.cardCode + "\n" +
          "**Related Cards: ** " + associatedCardsString + "\n"
          ,false);
        }

        if(currCard.type === 'Trap'){
          embed.addField("**Details** ",
          "**Keywords: ** " + currCard.keywords + "\n" +
          "**Type: ** " + currCard.supertype + " "+ currCard.type + "\n" +
          "**Rarity: ** " + currCard.rarity + "\n" +
          "**Region: ** " + currCard.region + "\n" +
          "**ID: ** " + currCard.cardCode + "\n" +
          "**Related Cards: ** " + associatedCardsString + "\n"
          ,false);
        }

        if(currCard.type === 'Ability'){
          embed.addField("**Details** ",
          "**Cost: ** " + currCard.cost + "\n" +
          "**Keywords: ** " + currCard.keywords + "\n" +
          "**Type: ** " + currCard.supertype + " "+ currCard.type + "\n" +
          "**Rarity: ** " + currCard.rarity + "\n" +
          "**Region: ** " + currCard.region + "\n" +
          "**ID: ** " + currCard.cardCode + "\n" +
          "**Related Cards: ** " + associatedCardsString + "\n"
          ,false);
        }

        message.channel.send({embed});
      }

      // get card by id
      if(command === "cardid"){
        const myCardID = message.content.slice(config.prefix.length + command.length)
        .trim()
        .toLowerCase()
        .replace(/\s/g, '');

        console.log(myCardID);

        var currCard = null;

        for(let i = 0; i < set.length; i++) {
          if(set[i].cardCode.toLowerCase().replace(/\s/g, '') === myCardID){
            currCard = set[i];
          }
        }

        if(currCard === null){
          message.channel.send("No matching card found!");
          return;
        }

        const artAttach = new Discord.Attachment(cardArt + currCard.cardCode + '.png', 'art.png');
        var regionAttach;

        // TEMPORARY FIX FOR NEUTRAL and ALL
        if(currCard.regionRef.toLowerCase() === 'neutral'){
          regionAttach = new Discord.Attachment(regionIcons + 'icon-all' + '.png', 'icon.png');
        }
        else{
          regionAttach = new Discord.Attachment(regionIcons + 'icon-' +
            currCard.regionRef.toLowerCase() + '.png', 'icon.png');
        }

        const embed = new Discord.RichEmbed()
          .setDescription('**Description:** ' + currCard.descriptionRaw)
          .setAuthor(client.user.username, client.user.avatarURL)
          .setColor(0x1c60ff)
          .attachFiles([artAttach, regionAttach])
          .setImage('attachment://art.png')
          .setThumbnail('attachment://icon.png')
          .setFooter(currCard.flavorText + '      Artist: ' + currCard.artistName)

          //get related cards
          var associatedCards = currCard.associatedCardRefs;
          var associatedCardsString = "";
          for(let i = 0; i < associatedCards.length; i++){
            function findCard(card){
              return card.cardCode === associatedCards[i];
            }

            var foundCard = set.find(findCard);

            if(i == associatedCards.length - 1){
              associatedCardsString += foundCard.name + " (" + foundCard.cardCode + ")";
              break;
            }
            associatedCardsString += foundCard.name + " (" + foundCard.cardCode + "), ";
          }

          // detail in title if card is collectible
          if(currCard.collectible === true){
            embed.setTitle(currCard.name + ' (Collectible)');
          }
          else{
            embed.setTitle(currCard.name);
          }

          // access different data depenidng on card type
          if(currCard.type === 'Spell'){
            embed.addField("**Details** ",
            "**Cost: ** " + currCard.cost + "\n" +
            "**Type: ** " + currCard.spellSpeed + " Spell\n" +
            "**Rarity: ** " + currCard.rarity + "\n" +
            "**Region: ** " + currCard.region + "\n" +
            "**ID: ** " + currCard.cardCode + "\n" +
            "**Related Cards: ** " + associatedCardsString + "\n"
            ,false);
          }

          if(currCard.type === 'Unit'){
            embed.addField("**Details** ",
            "**Cost: ** " + currCard.cost + "\n" +
            "**Attack: ** " + currCard.attack + "\n" +
            "**Health: ** " + currCard.health + "\n" +
            "**Keywords: ** " + currCard.keywords + "\n" +
            "**Type: ** " + currCard.supertype + " "+ currCard.type + "\n" +
            "**Rarity: ** " + currCard.rarity + "\n" +
            "**Region: ** " + currCard.region + "\n" +
            "**ID: ** " + currCard.cardCode + "\n" +
            "**Related Cards: ** " + associatedCardsString + "\n"
            ,false);
          }

          message.channel.send({embed});
      }

      if(command === "deck"){
        lorapi.deck("localhost:21337", function(data) {
          console.log(data);
          if(data.DeckCode !== null){
            message.channel.send(data.DeckCode);
          }
          else{
            message.channel.send("Player not in game!");
          }
        })
      }

      if(command === "lastgame"){
        lorapi.lastgame("localhost:21337", function(data) {
          console.log(data);
          if(data.LocalPlayerWon !== null){
            if(data.LocalPlayerWon){
              message.channel.send("Player won the last game!");
            }
            else{
              message.channel.send("Player lost the last game.");
            }
          }
          else{
            message.channel.send("No last game info!");
          }
        })
      }

      if(command === "currentgame"){
        lorapi.currentgame("localhost:21337", function(data) {
          console.log(data);
          if(data.PlayerName !== null){
            message.channel.send(data.PlayerName + " is in game against " +
            data.OpponentName + ".");
          }
          else{
            message.channel.send("Player not in game!");
          }
        })
      }
});

process.on('unhandledRejection', error => {
  // Won't execute
  console.log('unhandledRejection', error);
});

client.login(config.token);

/*const embed = new Discord.RichEmbed()
  .setTitle("This is your title, it can hold 256 characters")
  .setAuthor("Author Name", "https://i.imgur.com/lm8s41J.png")

   //Alternatively, use "#00AE86", [0, 174, 134] or an integer number.

  .setColor(0x00AE86)
  .setDescription("This is the main body of text, it can hold 2048 characters.")
  .setFooter("This is the footer text, it can hold 2048 characters", "http://i.imgur.com/w1vhFSR.png")
  .setImage("http://i.imgur.com/yVpymuV.png")
  .setThumbnail("http://i.imgur.com/p2qNFag.png")

   //Takes a Date object, defaults to current date.

  .setTimestamp()
  .setURL("https://discord.js.org/#/docs/main/indev/class/RichEmbed")
  .addField("This is a field title, it can hold 256 characters",
    "This is a field value, it can hold 1024 characters.")

   //Inline fields may not display as inline if the thumbnail and/or image is too big.

  .addField("Inline Field", "They can also be inline.", true)

   //Blank field, useful to create some space.

  .addBlankField(true)
  .addField("Inline Field 3", "You can have a maximum of 25 fields.", true);

  message.channel.send({embed});*/
