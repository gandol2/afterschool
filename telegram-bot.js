const TelegramBot = require('node-telegram-bot-api');
var fs = require('fs');

// replace the value below with the Telegram token you receive from @BotFather
const token = fs.readFileSync('token','utf-8');
//const token = '398043045:AAEK_JdOlaCRQySBecuQIz5TCpeoQehCJa8';

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

bot.getMe().then(function (me) {
    console.log('Hi my name is %s!', me.username);
});

//matches /start
bot.onText(/\/start/, function (msg, match) {
    var fromId = msg.from.id; // get the id, of who is sending the message
    var message = "안녕하세요. 텔레그램 봇 입니다.\n";
    message += "당신의 ID는 : " + fromId + " 입니다.";
    bot.sendMessage(fromId, message);
});

// Matches "/ping"
bot.onText(/\/ping/, function (msg, match) {
    const chatId = msg.chat.id;

// send a message to the chat acknowledging receipt of their message
    bot.sendMessage(chatId, '살아있습니다.');
});



// Matches "/echo [whatever]"
bot.onText(/\/echo (.+)/, (msg, match) => {
    // 'msg' is the received Message from Telegram
    // 'match' is the result of executing the regexp above on the text content
    // of the message

    const chatId = msg.chat.id;
    const resp = match[1]; // the captured "whatever"

    // send back the matched "whatever" to the chat
    bot.sendMessage(chatId, resp);
});




// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', (msg) => {
    const chatId = msg.chat.id;

    // send a message to the chat acknowledging receipt of their message
    bot.sendMessage(chatId, 'Received your message');
});