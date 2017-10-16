var request = require('request');
var requestSync = require('sync-request');
var cheerio = require('cheerio');
var iconv = require('iconv-lite');

const TelegramBot = require('node-telegram-bot-api');
var fs = require('fs');
var jsonfile = require('jsonfile');

const userFilePath = __dirname + "/user.json";
const adminFilePath = __dirname + "/admin.json";



try {
    jsonfile.readFileSync(userFilePath);
}catch(e){
    var defaultObj = {users : []};
    jsonfile.writeFileSync(userFilePath, defaultObj);
}

try {
    jsonfile.readFileSync(adminFilePath);
}catch(e){
    var defaultObj = {"users":[{"id":64078402,"username":"gandol2","name":"김 성식"}]};
    jsonfile.writeFileSync(adminFilePath, defaultObj);
}

var adminID = jsonfile.readFileSync(adminFilePath).users[0].id;



// replace the value below with the Telegram token you receive from @BotFather
const token = fs.readFileSync('token','utf-8');
//const token = '398043045:AAEK_JdOlaCRQySBecuQIz5TCpeoQehCJa8';

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

bot.getMe().then(function (me) {
    console.log('Hi my name is %s!', me.username);
});

var helpString = "사용 가능한 명령어는 다음과 같습니다.\n\n";
helpString += "/help 사용 가능한 명령어 출력\n";
helpString += "/ping 봇이 작동하는지 확인\n";
helpString += "/add PUSH를 받을 수 있도록 봇에 등록\n";
helpString += "/remove 더이상 PUSH가 가지 않도록 해제\n";


bot.onText(/\/help/, function (msg, match) {
    bot.sendMessage(msg.chat.id, helpString);
});

bot.onText(/\/ping/, function (msg, match) {
    bot.sendMessage(msg.chat.id, '작동중..\n' + Date());
});





//matches /start
bot.onText(/\/start/, function (msg, match) {
    var fromId = msg.from.id; // get the id, of who is sending the message
    var message = "안녕하세요. gandol2_afterschool 봇 입니다.\n";
    message += "저는 새 게시글이 생기면 알림을 주는 기능을 합니다.\n\n";
    message += helpString;

    bot.sendMessage(fromId, message);

    var exeUser = {id: msg.from.id, username: msg.from.username, name: msg.from.first_name + " " + msg.from.last_name};
    var exeUserMessage = exeUser.name + "(" + exeUser.username + "/" + exeUser.id + ")\n";
    bot.sendMessage(adminID, "[관리용] " + exeUserMessage + "가 \/start 명령어를 실행 하였습니다.");
});

//matches /등록
bot.onText(/\/add/, function (msg, match) {
    var fromuser = {id: msg.from.id, username: msg.from.username, name: msg.from.first_name + " " + msg.from.last_name};
    var message = fromuser.name + "(" + fromuser.username + "/" + fromuser.id + ")\n";

    var userFile = jsonfile.readFileSync(userFilePath);


    var idx = -1;
    for(var i = 0 ; i < userFile.users.length ; ++i)
    {
        if(userFile.users[i].id === fromuser.id)
        {
            idx = i;    // find it
            break;
        }
    }

    if (idx == -1) {
        userFile.users.push(fromuser);
        jsonfile.writeFileSync(userFilePath, userFile);

        message += "등록되었습니다.\n";
        message += "새로운 게시글이 올라오면 알려드릴게요.";
        bot.sendMessage(fromuser.id, message);

        var exeUser = {id: msg.from.id, username: msg.from.username, name: msg.from.first_name + " " + msg.from.last_name};
        var exeUserMessage = exeUser.name + "(" + exeUser.username + "/" + exeUser.id + ")";
        bot.sendMessage(adminID, "[관리용] " + exeUserMessage + "사용자가 등록되었습니다.");
    }
    else
    {
        message += "이미 등록된 ID 입니다.";
        bot.sendMessage(fromuser.id, message);
    }


});

//matches /해제
bot.onText(/\/remove/, function (msg, match) {
    var fromuser = {id: msg.from.id, username: msg.from.username, name: msg.from.first_name + " " + msg.from.last_name};
    var message = fromuser.name + "(" + fromuser.username + "/" + fromuser.id + ")\n";

    var userFile = jsonfile.readFileSync(userFilePath);


    var idx = -1;
    for(var i = 0 ; i < userFile.users.length ; ++i)
    {
        if(userFile.users[i].id === fromuser.id)
        {
            idx = i;    // find it
            break;
        }
    }

    if (idx != -1) {
        //userFile.users.push(fromuser);
        userFile.users.splice(idx, 1);
        jsonfile.writeFileSync(userFilePath, userFile);

        message += "해제되었습니다.";
        bot.sendMessage(fromuser.id, message);

        var exeUser = {id: msg.from.id, username: msg.from.username, name: msg.from.first_name + " " + msg.from.last_name};
        var exeUserMessage = exeUser.name + "(" + exeUser.username + "/" + exeUser.id + ")";
        bot.sendMessage(adminID, "[관리용] " + exeUserMessage + "사용자가 해제되었습니다.");
    }
    else
    {
        message += "등록되지 않은 ID 입니다.";
        bot.sendMessage(fromuser.id, message);
    }
});



function afterschool_for_personal_start() {
    console.log('call afterschool_for_personal_start()');

    var urlbase = "http://bsafterschool.pen.go.kr";      // 부산방과후학교지원센터 페이지
    var options = {
        url: urlbase + "/sub.php?MenuID=68",       // 개인위탁 강사모집 페이지
        encoding: null
    };



    request.get(options, function(error, response, body_buf) {
        if (error) throw error;


        var jsonfile = require('jsonfile');
        const lastIdxPersonalPath = __dirname + "/lastIdx_for_personal.json";
        try {
            jsonfile.readFileSync(lastIdxPersonalPath);
        }catch(e){
            var defaultObj = {lastIdx : 0};
            jsonfile.writeFileSync(lastIdxPersonalPath, defaultObj);
        }
        var lastIdx = jsonfile.readFileSync(lastIdxPersonalPath);        // 마지막 게시글 번호 Read
        var latestIdx;

        if(lastIdx.lastIdx == undefined)
            lastIdx.lastIdx = 0;

        var body = iconv.decode(body_buf, 'EUC-KR');
        var $ = cheerio.load(body);

        var trElements = $('#board-list tbody tr');

        for(var i = trElements.length-1 ; i >= 0 ; --i)
        {
            var tbodyArray = $(trElements[i]).find("td").toArray();
            var nowIdx = $(tbodyArray[0]).text();

            latestIdx = parseInt(nowIdx);       // 번호

            if(parseInt(nowIdx) > lastIdx.lastIdx) {

                var title = $(tbodyArray[1]).find('a').text();  // 제목
                var writer = $(tbodyArray[2]).text();       // 글쓴이
                var start = $(tbodyArray[3]).text();        // 작성일
                var end = $(tbodyArray[4]).text();          // 마감일
                var status = $(tbodyArray[5]).text().replace(/\n/g, '').replace(/\t/g, '');     // 상태

                var subPageLink = urlbase + $(tbodyArray[1]).find('a').attr('href');    // 게시글 링크

                var res = requestSync('GET', subPageLink);

                var subPage$ = cheerio.load(iconv.decode(res.getBody(), 'EUC-KR'));
                var board_contents = subPage$('td.board_contents p').text().replace(/\n/g, '').replace(/\t/g, '');  // 본문내용

                var fileName = subPage$('td.file a').text();        // 첨부파일명
                var tempStr = subPage$('td.file a').attr('href');
                var fileURL = urlbase + tempStr.substr(1);      // 첨부파일 링크

                var message = "[★개인강사모집★]\n";
                message += "번호 : " + nowIdx + "\n";
                message += "제목 : " + title + "\n";
                message += "글쓴이 : " + writer+ "\n";
                message += "작성일 : " + start + "\n";
                message += "마감일 : " + end + "\n";
                message += "상태 : " + status+ "\n";
                message += "본문내용 : " + board_contents+ "\n";
                message += "본문링크 : " + subPageLink+ "\n\n";
                message += "첨부파일 : " + fileName+ "\n";
                message += "첨부파일링크 : " + fileURL+ "\n";
                message += "(웹 브라우저로 열어주세요.)";

                console.log(message);

                var userFile = jsonfile.readFileSync(userFilePath);
                for(var j = 0 ; j < userFile.users.length ; ++j) {
                    bot.sendMessage(userFile.users[j].id, message);
                }

            }
        }

        if(latestIdx !== lastIdx.lastIdx)     // 마지막 게시글 번호 저장
        {
            lastIdx = {lastIdx : latestIdx};
            jsonfile.writeFileSync(lastIdxPersonalPath, lastIdx);
        }
    });

};




function afterschool_for_company_start() {
    console.log('call afterschool_for_company_start()');

    var urlbase = "http://bsafterschool.pen.go.kr";      // 부산방과후학교지원센터 페이지
    var options = {
        url: urlbase + "/sub.php?MenuID=71",       // 업체위탁공고 게시판
        encoding: null
    };



    request.get(options, function(error, response, body_buf) {
        if (error) throw error;


        var jsonfile = require('jsonfile');
        const lastIdxCompanyPath = __dirname + "/lastIdx_for_company.json";
        try {
            jsonfile.readFileSync(lastIdxCompanyPath);
        }catch(e){
            var defaultObj = {lastIdx : 0};
            jsonfile.writeFileSync(lastIdxCompanyPath, defaultObj);
        }
        var lastIdx = jsonfile.readFileSync(lastIdxCompanyPath);        // 마지막 게시글 번호 Read
        var latestIdx;

        if(lastIdx.lastIdx == undefined)
            lastIdx.lastIdx = 0;

        var body = iconv.decode(body_buf, 'EUC-KR');
        var $ = cheerio.load(body);

        var trElements = $('#board-list tbody tr');

        for(var i = trElements.length-1 ; i >= 0 ; --i)
        {
            var tbodyArray = $(trElements[i]).find("td").toArray();
            var nowIdx = $(tbodyArray[0]).text();




            if(true == isNaN(parseInt(nowIdx)))
                continue;

            latestIdx = parseInt(nowIdx);       // 번호

            if(parseInt(nowIdx) > lastIdx.lastIdx) {

                var title = $(tbodyArray[1]).find('a').text();  // 제목
                var writer = $(tbodyArray[2]).text();       // 글쓴이
                var start = $(tbodyArray[3]).text();        // 작성일
                var end = $(tbodyArray[4]).text();          // 마감일
                var status = $(tbodyArray[5]).text().replace(/\n/g, '').replace(/\t/g, '');     // 상태

                var subPageLink = urlbase + $(tbodyArray[1]).find('a').attr('href');    // 게시글 링크

                var res = requestSync('GET', subPageLink);

                var subPage$ = cheerio.load(iconv.decode(res.getBody(), 'EUC-KR'));
                var board_contents = subPage$('td.board_contents p').text().replace(/\n/g, '').replace(/\t/g, '');  // 본문내용

                var fileName = subPage$('td.file a').text();        // 첨부파일명
                var tempStr = subPage$('td.file a').attr('href');
                var fileURL = urlbase + tempStr.substr(1);      // 첨부파일 링크

                var message = "[☆업체위탁공고☆]\n";
                message += "번호 : " + nowIdx + "\n";
                message += "제목 : " + title + "\n";
                message += "글쓴이 : " + writer+ "\n";
                message += "작성일 : " + start + "\n";
                message += "마감일 : " + end + "\n";
                message += "상태 : " + status+ "\n";
                message += "본문내용 : " + board_contents+ "\n";
                message += "본문링크 : " + subPageLink+ "\n\n";
                message += "첨부파일 : " + fileName+ "\n";
                message += "첨부파일링크 : " + fileURL+ "\n";
                message += "(웹 브라우저로 열어주세요.)";

                console.log(message);

                var userFile = jsonfile.readFileSync(userFilePath);
                for(var j = 0 ; j < userFile.users.length ; ++j) {
                    bot.sendMessage(userFile.users[j].id, message);
                }

            }
        }

        if(latestIdx !== lastIdx.lastIdx)     // 마지막 게시글 번호 저장
        {
            lastIdx = {lastIdx : latestIdx};
            jsonfile.writeFileSync(lastIdxCompanyPath, lastIdx);
        }
    });

};


setInterval(afterschool_for_personal_start, 60000 * 10);
setInterval(afterschool_for_company_start, 60000 * 10);
//afterschool_for_personal_start();
//afterschool_for_company_start();