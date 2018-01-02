var request = require('request');
var requestSync = require('sync-request');
var cheerio = require('cheerio');
var iconv = require('iconv-lite');
var destroy = require('destroy');

const TelegramBot = require('node-telegram-bot-api');

const download = require('download');
var fs = require('fs');
var jsonfile = require('jsonfile');
var hwp = require("./node-hwp");
var Promise = require('bluebird');

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

;



bot.getMe().then(function (me) {
    console.log('Hi my name is %s!', me.username);
});

var helpString = "사용 가능한 명령어는 다음과 같습니다.\n\n";
helpString += "=================[기본명령어]===================\n";
helpString += "/help : 사용 가능한 명령어 출력\n";
helpString += "/ping : 봇이 작동하는지 확인\n";
helpString += "/add : PUSH를 받을 수 있도록 봇에 등록\n";
helpString += "/remove : 더이상 PUSH가 가지 않도록 해제\n";
helpString += "=================[키워드명령어]===================\n";
helpString += "/key_add : 키워드 등록\n";
helpString += "/key_del : 키워드 삭제\n";
helpString += "/key_show : 등록된 키워드 목록\n";

var key_menu = null;
var msg_broad_flag = false;

bot.on('message', function(msg, match){
    var user_id = msg.chat.id;
    var user_text = msg.text.toString();

    var space_idx = user_text.indexOf(' ');

    if(user_id == adminID && msg_broad_flag == true)
    {
        if(msg.text.toString().toLowerCase().indexOf('취소') === 0) {
            sendMsg(adminID, '브로드 캐스트가 취소 되었습니다.')
            msg_broad_flag = false
        }
        else {
            sendBroadCast(user_text);
            msg_broad_flag = false;
        }
    }

    switch(key_menu)
    {
        // 키워드 등록
        case 'key_add':
            if(space_idx != -1) {
                bot.sendMessage(msg.chat.id, "공백 노노해~\n다시한번 잘 입력해봐요^^");
                break;
            }

            if(user_text.indexOf('/') != -1)
            {
                bot.sendMessage(msg.chat.id, "특수문자 노노해~\n다시한번 잘 입력해봐요^^");
                break;
            }

            if (msg.text.toString().toLowerCase().indexOf('취소') === 0) {
                bot.sendMessage(msg.chat.id, "키워드 등록 절차가 취소되었습니다.");
                console.log(msg.chat.id + " 사용자의 키워드 입력이 취소 되었습니다.");
                key_menu = null;
                break;
            }

            fs.readFile('./user.json', 'utf-8', function(err, data) {
                if (err) throw err

                var arrayOfObjects = JSON.parse(data);

                console.log(user_id);

                for(var i = 0 ; i < arrayOfObjects.users.length ; ++i)
                {
                    if(arrayOfObjects.users[i].id == user_id)
                    {
                        var key_idx = arrayOfObjects.users[i].key.indexOf(user_text);
                        if(key_idx === -1)
                        {
                            if(arrayOfObjects.users[i].key.length == 1)
                            {
                                if(arrayOfObjects.users[i].key[0] == 'all')
                                {
                                    arrayOfObjects.users[i].key.splice(0,1);
                                    //console.log("\'all\' 하나 밖에 없습니다.");
                                }
                            }

                            arrayOfObjects.users[i].key.push(user_text);
                            bot.sendMessage(msg.chat.id, "\'" + user_text + "\' 키워드가 등록 되었습니다.");

                            var exeUserMessage = msg.from.first_name + " " + msg.from.last_name + "(" + msg.from.username + "/" + msg.from.id + ")";
                            bot.sendMessage(adminID, "[관리용] " + exeUserMessage + "가 \'" + user_text + "\' 키워드를 등록 하였습니다.");

                        }
                        else
                        {
                            bot.sendMessage(msg.chat.id, "\'" + user_text + "\' 키워드는 이미 동륵되어 있습니다.\n/key_add 명령을 종료 합니다.");
                        }

                        key_menu = null;
                        break;
                    }
                }
                fs.writeFile('./user.json', JSON.stringify(arrayOfObjects), 'utf-8', function(err) {
                    if (err) throw err
                    console.log('Done!');
                })
            })
            break;

            // 키워드 삭제
        case 'key_del':
            if(space_idx != -1) {
                bot.sendMessage(msg.chat.id, "공백 노노해~\n다시한번 잘 입력해봐요^^");
                break;
            }
            if(user_text.indexOf('/') != -1)
            {
                bot.sendMessage(msg.chat.id, "특수문자 노노해~\n다시한번 잘 입력해봐요^^");
                break;
            }
            if (msg.text.toString().toLowerCase().indexOf('취소') === 0) {
                bot.sendMessage(msg.chat.id, "키워드 삭제 절차가 취소되었습니다.");
                console.log(msg.chat.id + " 사용자의 키워드 삭제가 취소 되었습니다.");
                key_menu = null;
                break;
            }

            fs.readFile('./user.json', 'utf-8', function(err, data) {
                if (err) throw err

                var arrayOfObjects = JSON.parse(data);

                console.log(user_id);

                for(var i = 0 ; i < arrayOfObjects.users.length ; ++i)
                {
                    if(arrayOfObjects.users[i].id == user_id)
                    {
                        var key_idx = arrayOfObjects.users[i].key.indexOf(user_text);
                        if(key_idx === -1)
                        {
                            bot.sendMessage(msg.chat.id, "\'" + user_text + "\' 는 등록되지 않은 키워드 입니다.\n/key_del 명령을 종료 합니다.");
                            key_menu = null;
                            break;
                        }
                        else
                        {
                            arrayOfObjects.users[i].key.splice(key_idx,1);
                            bot.sendMessage(msg.chat.id, "\'" + user_text + "\' 키워드가 삭제 되었습니다.");

                            if(arrayOfObjects.users[i].key.length == 0)     // 마지막 키워드를 삭제했으면 'all' 입력
                            {
                                arrayOfObjects.users[i].key.push('all');
                            }
                        }

                        var exeUserMessage = msg.from.first_name + " " + msg.from.last_name + "(" + msg.from.username + "/" + msg.from.id + ")";
                        bot.sendMessage(adminID, "[관리용] " + exeUserMessage + "가 \'" + user_text + "\' 키워드를 삭제 하였습니다.");
                        key_menu = null;
                        break;
                    }
                }
                fs.writeFile('./user.json', JSON.stringify(arrayOfObjects), 'utf-8', function(err) {
                    if (err) throw err
                    console.log('Done!');
                })
            })

            break;



        // default:
        //     bot.sendMessage(msg.chat.id, helpString);
        //     break;
    }


    // var Hi = "/key_add";
    // if (msg.text.toString().toLowerCase().indexOf(Hi) === 0) {
    //     bot.sendMessage(msg.chat.id, "Hello dear user");
    // }
    // var bye = "/key_del";
    // if (msg.text.toString().toLowerCase().includes(bye)) {
    //     bot.sendMessage(msg.chat.id, "Hope to see you around again , Bye");
    // }
    // var robot = "/key_show";
    // if (msg.text.indexOf(robot) === 0) {
    //     bot.sendMessage(msg.chat.id, "Yes I'm robot but not in that way!");
    // }
});

// 키워드 등록 메뉴 
bot.onText(/\/key_add/, function (msg, match) {
    sendStr = "등록하실 키워드 한개를 입력 해주세요.\n";
    sendStr += "공백은 노노~\n";
    sendStr += "예시) 과목, 지역, 학교이름, 학교종류 등.\n\n";
    sendStr += "\'취소\' 키워드 입력시 등록 절차가 취소 됩니다.\n";
    bot.sendMessage(msg.chat.id, sendStr);
    key_menu = 'key_add';
});

// 키워드 등록 메뉴
bot.onText(/\/m/, function (msg, match) {
    if(msg.chat.id == adminID) {
        sendStr = "브로드 캐스트 메시지를 입력 하세요.\n";
        sendStr += "\'취소\' 입력시 브로드 캐스트가 취소 됩니다.\n\n";
        bot.sendMessage(adminID, sendStr);
        msg_broad_flag = true;
    }
});


// 키워드 삭제 메뉴 
bot.onText(/\/key_del/, function (msg, match) {
    sendStr = "삭제하실 키워드 한개를 입력 해주세요.\n";
    sendStr += "\'취소\' 키워드 입력시 등록 절차가 취소 됩니다.\n\n";

    var userFile = jsonfile.readFileSync(userFilePath);


    var idx = -1;
    for(var i = 0 ; i < userFile.users.length ; ++i)
    {
        if(userFile.users[i].id === msg.from.id)
        {
            idx = i;    // find it
            break;
        }
    }

    if (idx == -1) {
        bot.sendMessage(msg.from.id, "등록되지 않은 사용자 입니다. \n/add 명령어를 사용하여 봇에 등록 해주세요");
        return;
    }
    else
    {
        var key_list = "";
        for(var i = 0 ; i < userFile.users[idx].key.length ; ++i)
        {
            key_list += '- ' + userFile.users[idx].key[i] + '\n';

        }

        bot.sendMessage(msg.from.id, "=== 등록된 키워드 목록 ===\n" + key_list);
    }

    bot.sendMessage(msg.chat.id, sendStr);
    key_menu = 'key_del';
});

// 등록된 키워드 목록 메뉴
bot.onText(/\/key_show/, function (msg, match) {
    var userFile = jsonfile.readFileSync(userFilePath);


    var idx = -1;
    for(var i = 0 ; i < userFile.users.length ; ++i)
    {
        if(userFile.users[i].id === msg.from.id)
        {
            idx = i;    // find it
            break;
        }
    }

    if (idx == -1) {
        bot.sendMessage(msg.from.id, "등록되지 않은 사용자 입니다. \n/add 명령어를 사용하여 봇에 등록 해주세요");
        return;
    }
    else
    {
        var key_list = "";
        for(var i = 0 ; i < userFile.users[idx].key.length ; ++i)
        {
            key_list += '- ' + userFile.users[idx].key[i] + '\n';

        }

        bot.sendMessage(msg.from.id, "=== 등록된 키워드 목록 ===\n" + key_list);
    }

});

bot.onText(/\/help/, function (msg, match) {
    bot.sendMessage(msg.chat.id, helpString);
});

bot.onText(/\/ping/, function (msg, match) {
    console.log(msg.chat.id + " : /ping 명령어 수행 " + Date() );
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
    var exeUserMessage = msg.from.first_name + " " + msg.from.last_name + "(" + msg.from.username + "/" + msg.from.id + ")";
    bot.sendMessage(adminID, "[관리용] " + exeUserMessage + " 가 \/start 명령어를 실행 하였습니다.");
});

//matches /등록
bot.onText(/\/add/, function (msg, match) {
    var fromuser = {id: msg.from.id, username: msg.from.username, name: msg.from.first_name + " " + msg.from.last_name, key:['all']};
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

        message += "사용자 목록에 등록되었습니다.\n";
        message += "새로운 게시글이 올라오면 알려드릴게요.\n\n";
        message += "현재 모든 게시글이 PUSH 갈수 있으니 \n";
        message += "/key_add 명령어를 사용하여 관심키워드를 등록 해주세요 ^^";
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
        url: urlbase + "/sub.php?MenuID=68&gotoPage=1",       // 개인위탁 강사모집 페이지
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
                var board_contents = subPage$('td.board_contents p').text().replace(/\n/g, '').replace(/\t/g, '').replace(/\s{2,}/g, ' ');  // 본문내용

                var fileName = subPage$('td.file a').text();        // 첨부파일명
                var tempStr = subPage$('td.file a').attr('href');
                var fileURL = urlbase + tempStr.substr(1);      // 첨부파일 링크

                // var msg_title = "[★개인강사모집★]\n";
                // var msg_body = "번호 : " + nowIdx + "\n";
                // msg_body += "제목 : " + title + "\n";
                // msg_body += "글쓴이 : " + writer+ "\n";
                // msg_body += "작성일 : " + start + "\n";
                // msg_body += "마감일 : " + end + "\n";
                // msg_body += "상태 : " + status+ "\n";
                // msg_body += "본문내용 : " + board_contents+ "\n";
                // msg_body += "본문링크 : " + subPageLink+ "\n\n";
                // msg_body += "첨부파일 : " + fileName+ "\n";
                // msg_body += "첨부파일링크 : " + fileURL+ "\n";
                // msg_body += "(웹 브라우저로 열어주세요.)";

                var msg_title = "👩‍🏫 *[개인 위탁]*\n";



                var msg_body = "🏫 *기본정보*  " + "(No." + nowIdx + ")" + "\n";
                msg_body += "*기관* : " + writer + " [위치보기(베타)](http://map.daum.net/?map_type=DEFAULT&map_hybrid=false&q=부산" + writer + ") 🔗 \n";    // 글번호, 글쓴이
                msg_body += "*일정* : " + start + " ∼ " + end + '\n';    // 작성일 ~ 마감일
                msg_body += "*제목* : " + title + '\n\n';    // 제목

                msg_body += "📃 *본문 내용* \n";
                msg_body +=  "```" + board_contents  + "```"  + "\n";
                msg_body += '[본문 링크]('+subPageLink+') 🔗\n\n';

                msg_body += "💾 첨부파일\n";
                //msg_body += fileName + "\n";
                msg_body += '['+fileName+']('+fileURL+') 🔗\n(웹 브라우저로 열어주세요)\n\n';


                var msg_keyword;









                // 첨부파일 다운로드 ------- [시작]


                // ★★★★★★★★★★★★★★★★★★★★ 게시글 목록중 마지막 게시글의 정보만 텔레그램 메시지로 보내짐.... 콜백 때문인듯..
                //request.get( fileURL ).on('response', function( res ){
                request.get( {url:fileURL, msg_title:msg_title, msg_body:msg_body} ).on('response', function( res ){


                    // extract filename
                    var filename = res.req['path'].split('=')[1] + '.hwp';
                    console.log('파일명 : ' + filename);

                    // create file write stream
                    var fws = fs.createWriteStream( 'downloads/' + filename).on('open', function(fd){
                        console.log('●●●●●●●●●●●●●●●●●●●●●●●●●●● pipe fd : ' + fd  + '(' + filename + ')');
                        return fd;
                    });;


                    //console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@' + this.msg_title, this.msg_body);
                    res.on( 'end', function(arg1){
                        // go on with processing
                        console.log('[★INFO★] download success : ' + filename);

                        //console.log('-----------------------------------' + this.request.msg_title, this.request.msg_body); // 여기까지 정상적임..
                        //console.log('----------------------------------' + msg_title, msg_body);


                        var asyncfunction = function(file, title, body){
                            return new Promise(function(resolved,rejected){
                                hwp.open(file, 'hwp', function(err, doc){
                                    if(err)
                                        rejected({doc:doc, err:err, title:title, body:body, file:file});
                                    else
                                        resolved({doc:doc, hml:doc.toHML(false), title:title, body:body, file:file});
                                });
                            });
                        }

                        var promise = asyncfunction('downloads/' + filename, this.request.msg_title, this.request.msg_body);



                        promise.then(function(data){
                            try {
                                var userFile = jsonfile.readFileSync(userFilePath); // 사용자 목록 파일 read
                                for(var j = 0 ; j < userFile.users.length ; ++j) {      // 사용자 수만큼 반복
                                    var key_string = userFile.users[j].key[0];

                                    if(key_string == 'all')     // 처음 키워드가 all 이면 바로 전송
                                    {
                                        sendMsg(userFile.users[j].id, data['title'] + data['body']);
                                    }
                                    else    // 키워드가 존재 하는 경우
                                    {
                                        var key_flag = false;       // 키워드가 유효하지 않다고 가정..

                                        var msg_keyword = '❤️ *키워드* : ';
                                        for(var key_num = 0 ; key_num < userFile.users[j].key.length ; ++key_num)   // 키워드 수만큼 반복
                                        {
                                            key_string = userFile.users[j].key[key_num];

                                            var results = data['hml'].match(new RegExp(key_string,"g"));
                                            if(results != null) {
                                                key_flag = true;    // 키워드가 하나라도 존재
                                                msg_keyword += key_string + '(' + results.length + ') ';
                                                //console.log('\'' + key_string + '\'키워드 검색 결과 : ' + results.length); // 2개이므로 2가 출력된다!
                                            }
                                        }


                                        if(key_flag == true)    // 키워드가 하나라도 존재
                                        {
                                            msg_string = data['title'] + msg_keyword + '\n' + data['body'];
                                            msg_keyword += '\n';
                                            //console.log(msg_string);
                                            sendMsg(userFile.users[j].id, msg_string);
                                        }
                                    }
                                }

                            } catch(e){
                                msg_keyword = '🖤 *키워드* : 키워드를 분석 할 수 없는 첨부파일 입니다. 😱';
                                for(var j = 0 ; j < userFile.users.length ; ++j) {      // 사용자 수만큼 반복
                                    sendMsg(userFile.users[j].id, data['title'] + msg_keyword + '\n' + data['body']);
                                }
                                var msg_manage = "[관리용][오류]\n";
                                msg_manage += data['title'] + msg_keyword + '\n' + data['body'] + '\n\n';
                                msg_manage += "------------------[에러 로그]------------------\n";
                                msg_manage += "```" + e.toString()  + "```"  ;
                                msg_manage += "\n [끝] \n";
                                sendMsg(adminID, msg_manage);

                            } finally {
                                console.log('[★INFO★] delete : ' + data.doc._doc['_filename']);

                                console.log('[★INFO★] close fd : ' + data.doc._doc['_fd']);
                                fs.closeSync(data.doc._doc['_fd']);
                                fs.unlinkSync(data.doc._doc['_filename']);        // 파일 삭제 ★★★★★★ 파일이 안지워짐...
                                console.log('[★INFO★] delete [OK] : ' + data.doc._doc['_filename']);
                            }





                        }).catch(function(err){
                            var userFile = jsonfile.readFileSync(userFilePath); // 사용자 목록 파일 read
                            msg_keyword = '🖤 *키워드* : 키워드를 분석 할 수 없는 첨부파일 입니다. 😱';
                            for(var j = 0 ; j < userFile.users.length ; ++j) {      // 사용자 수만큼 반복
                                sendMsg(userFile.users[j].id, err['title'] + msg_keyword + '\n' + err['body']);
                            }
                            var msg_manage = "[관리용][오류]\n";
                            msg_manage += err['title'] + msg_keyword + '\n' + err['body'] + '\n\n';
                            msg_manage += "------------------[에러 로그]------------------\n";
                            msg_manage += "```" + err['err'].toString()  + "```"  ;
                            msg_manage += "\n [끝] \n";
                            sendMsg(adminID, msg_manage);


                            console.log('[★INFO★] delete : ' + err.doc._doc['_filename']);

                            fs.closeSync(err.doc._doc['_fd']);
                            fs.unlinkSync(err.doc._doc['_filename']);        // 파일 삭제 ★★★★★★ 파일이 안지워짐...
                            console.log('[★INFO★] delete [OK] : ' + err.doc._doc['_filename']);

                        }); // 여기가 비동기 결과에 대한 콜백함
                    }).pipe( fws );
                });





/*
                //var path2    = require('path');
                //var request2 = require('request');
                var hwp = require("./node-hwp");
                console.log('@@@@@@@@@@@@@@@@' + fileURL);
                // 171227_★이부분이 콜백으로 호출되서.. 파일 URL이 겹침...
                var req_file = request(fileURL).on('response', function(res) {
                    console.log('++++++++++++++++' + fileURL);
                    var filename = 'downloads/' + fileURL.split("=").pop(-1);
                    var contentDisp = res.headers['content-disposition'];

                    req_file.pipe(fs.createWriteStream(require('path').join(__dirname, filename)));

                    req_file.on('end', function () {
                        console.log(filename + ' download [OK]');
                        hwp.open(filename, function(err, doc){
                            var hml = doc.toHML();
                            //console.log(hml);

                            var userFile = jsonfile.readFileSync(userFilePath);     // 사용자 목록 파일 read

                            for(var j = 0 ; j < userFile.users.length ; ++j) {      // 사용자 수만큼 반복
                                var key_string = userFile.users[j].key[0];

                                if(key_string == 'all')     // 처음 키워드가 all 이면 바로 전송
                                {
                                    bot.sendMessage(userFile.users[j].id, msg_title + msg_body);
                                }
                                else    // 키워드가 존재 하는 경우
                                {
                                    var key_flag = false;       // 키워드가 유효하지 않다고 가정..

                                    msg_keyword = '● 키워드 : ';
                                    for(var key_num = 0 ; key_num < userFile.users[j].key.length ; ++key_num)   // 키워드 수만큼 반복
                                    {
                                        key_string = userFile.users[j].key[key_num];
                                        
                                        var results = hml.match(new RegExp(key_string,"g"));
                                        if(results != null) {
                                            key_flag = true;    // 키워드가 하나라도 존재
                                            msg_keyword += key_string + '(' + results.length + ') ';
                                            console.log('\'' + key_string + '\'키워드 검색 결과 : ' + results.length); // 2개이므로 2가 출력된다!
                                        }
                                    }

                                    if(key_flag == true)    // 키워드가 하나라도 존재
                                    {
                                        msg_keyword += '\n';
                                        bot.sendMessage(userFile.users[j].id, msg_title + msg_keyword + '\n' + msg_body);
                                    }

                                }
                            }
                            fs.unlinkSync(filename);        // 파일 삭제
                        });
                    });
                });
*/
                // 첨부파일 다운로드 ------- [끝]


                







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

            if(true == isNaN(parseInt(nowIdx)))     // 공지
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
                var board_contents = subPage$('td.board_contents p').text().replace(/\n/g, '').replace(/\t/g, '').replace(/\s{2,}/g, ' ');  // 본문내용

                var fileName = subPage$('td.file a').text();        // 첨부파일명
                var tempStr = subPage$('td.file a').attr('href');
                var fileURL = urlbase + tempStr.substr(1);      // 첨부파일 링크

                // var msg_title = "[★개인강사모집★]\n";
                // var msg_body = "번호 : " + nowIdx + "\n";
                // msg_body += "제목 : " + title + "\n";
                // msg_body += "글쓴이 : " + writer+ "\n";
                // msg_body += "작성일 : " + start + "\n";
                // msg_body += "마감일 : " + end + "\n";
                // msg_body += "상태 : " + status+ "\n";
                // msg_body += "본문내용 : " + board_contents+ "\n";
                // msg_body += "본문링크 : " + subPageLink+ "\n\n";
                // msg_body += "첨부파일 : " + fileName+ "\n";
                // msg_body += "첨부파일링크 : " + fileURL+ "\n";
                // msg_body += "(웹 브라우저로 열어주세요.)";

                var msg_title = "🏢 *[업체 위탁]*\n";



                var msg_body = "🏫 *기본정보*  " + "(No." + nowIdx + ")" + "\n";
                msg_body += "*기관* : " + writer + " [위치보기(베타)](http://map.daum.net/?map_type=DEFAULT&map_hybrid=false&q=부산" + writer + ") 🔗 \n";    // 글번호, 글쓴이
                msg_body += "*일정* : " + start + " ∼ " + end + '\n\n';    // 작성일 ~ 마감일
                msg_body += "*제목* : " + title + '\n\n';    // 제목

                msg_body += "📃 *본문 내용* \n";
                msg_body +=  "```" + board_contents  + "```"  + "\n";
                msg_body += '[본문 링크]('+subPageLink+') 🔗\n\n';

                msg_body += "💾 첨부파일\n";
                //msg_body += fileName + "\n";
                msg_body += '['+fileName+']('+fileURL+') 🔗\n(웹 브라우저로 열어주세요)\n\n';


                var msg_keyword;









                // 첨부파일 다운로드 ------- [시작]


                // ★★★★★★★★★★★★★★★★★★★★ 게시글 목록중 마지막 게시글의 정보만 텔레그램 메시지로 보내짐.... 콜백 때문인듯..
                //request.get( fileURL ).on('response', function( res ){
                request.get( {url:fileURL, msg_title:msg_title, msg_body:msg_body} ).on('response', function( res ){


                    // extract filename
                    var filename = res.req['path'].split('=')[1] + '.hwp';
                    console.log('파일명 : ' + filename);

                    // create file write stream
                    var fws = fs.createWriteStream( 'downloads/' + filename).on('open', function(fd){
                        console.log('●●●●●●●●●●●●●●●●●●●●●●●●●●● pipe fd : ' + fd  + '(' + filename + ')');
                        return fd;
                    });;


                    //console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@' + this.msg_title, this.msg_body);
                    res.on( 'end', function(arg1){
                        // go on with processing
                        console.log('[★INFO★] download success : ' + filename);

                        //console.log('-----------------------------------' + this.request.msg_title, this.request.msg_body); // 여기까지 정상적임..
                        //console.log('----------------------------------' + msg_title, msg_body);


                        var asyncfunction = function(file, title, body){
                            return new Promise(function(resolved,rejected){
                                hwp.open(file, 'hwp', function(err, doc){
                                    if(err)
                                        rejected({doc:doc, err:err, title:title, body:body, file:file});
                                    else
                                        resolved({doc:doc, hml:doc.toHML(false), title:title, body:body, file:file});
                                });
                            });
                        }

                        var promise = asyncfunction('downloads/' + filename, this.request.msg_title, this.request.msg_body);



                        promise.then(function(data){
                            try {
                                var userFile = jsonfile.readFileSync(userFilePath); // 사용자 목록 파일 read
                                for(var j = 0 ; j < userFile.users.length ; ++j) {      // 사용자 수만큼 반복
                                    var key_string = userFile.users[j].key[0];

                                    if(key_string == 'all')     // 처음 키워드가 all 이면 바로 전송
                                    {
                                        sendMsg(userFile.users[j].id, data['title'] + data['body']);
                                    }
                                    else    // 키워드가 존재 하는 경우
                                    {
                                        var key_flag = false;       // 키워드가 유효하지 않다고 가정..

                                        var msg_keyword = '❤️ *키워드* : ';
                                        for(var key_num = 0 ; key_num < userFile.users[j].key.length ; ++key_num)   // 키워드 수만큼 반복
                                        {
                                            key_string = userFile.users[j].key[key_num];

                                            var results = data['hml'].match(new RegExp(key_string,"g"));
                                            if(results != null) {
                                                key_flag = true;    // 키워드가 하나라도 존재
                                                msg_keyword += key_string + '(' + results.length + ') ';
                                                //console.log('\'' + key_string + '\'키워드 검색 결과 : ' + results.length); // 2개이므로 2가 출력된다!
                                            }
                                        }


                                        if(key_flag == true)    // 키워드가 하나라도 존재
                                        {
                                            msg_string = data['title'] + msg_keyword + '\n' + data['body'];
                                            msg_keyword += '\n';
                                            //console.log(msg_string);
                                            sendMsg(userFile.users[j].id, msg_string);
                                        }
                                    }
                                }

                            } catch(e){
                                msg_keyword = '🖤 *키워드* : 키워드를 분석 할 수 없는 첨부파일 입니다. 😱';
                                for(var j = 0 ; j < userFile.users.length ; ++j) {      // 사용자 수만큼 반복
                                    sendMsg(userFile.users[j].id, data['title'] + msg_keyword + '\n' + data['body']);
                                }
                                var msg_manage = "[관리용][오류]\n";
                                msg_manage += data['title'] + msg_keyword + '\n' + data['body'] + '\n\n';
                                msg_manage += "------------------[에러 로그]------------------\n";
                                msg_manage += e.toString();
                                msg_manage += "\n [끝] \n";
                                sendMsg(adminID, msg_manage);

                            } finally {
                                console.log('[★INFO★] delete : ' + data.doc._doc['_filename']);

                                console.log('[★INFO★] close fd : ' + data.doc._doc['_fd']);
                                fs.closeSync(data.doc._doc['_fd']);
                                fs.unlinkSync(data.doc._doc['_filename']);        // 파일 삭제 ★★★★★★ 파일이 안지워짐...
                                console.log('[★INFO★] delete [OK] : ' + data.doc._doc['_filename']);
                            }





                        }).catch(function(err){
                            var userFile = jsonfile.readFileSync(userFilePath); // 사용자 목록 파일 read
                            msg_keyword = '🖤 *키워드* : 키워드를 분석 할 수 없는 첨부파일 입니다. 😱';
                            for(var j = 0 ; j < userFile.users.length ; ++j) {      // 사용자 수만큼 반복
                                sendMsg(userFile.users[j].id, err['title'] + msg_keyword + '\n' + err['body']);
                            }
                            var msg_manage = "[관리용][오류]\n";
                            msg_manage += err['title'] + msg_keyword + '\n' + err['body'] + '\n\n';
                            msg_manage += "------------------[에러 로그]------------------\n";
                            msg_manage += err['err'];
                            msg_manage += "\n [끝] \n";
                            sendMsg(adminID, msg_manage);


                            console.log('[★INFO★] delete : ' + err.doc._doc['_filename']);

                            fs.closeSync(err.doc._doc['_fd']);
                            fs.unlinkSync(err.doc._doc['_filename']);        // 파일 삭제 ★★★★★★ 파일이 안지워짐...
                            console.log('[★INFO★] delete [OK] : ' + err.doc._doc['_filename']);

                        }); // 여기가 비동기 결과에 대한 콜백함
                    }).pipe( fws );
                });





                /*
                                //var path2    = require('path');
                                //var request2 = require('request');
                                var hwp = require("./node-hwp");
                                console.log('@@@@@@@@@@@@@@@@' + fileURL);
                                // 171227_★이부분이 콜백으로 호출되서.. 파일 URL이 겹침...
                                var req_file = request(fileURL).on('response', function(res) {
                                    console.log('++++++++++++++++' + fileURL);
                                    var filename = 'downloads/' + fileURL.split("=").pop(-1);
                                    var contentDisp = res.headers['content-disposition'];

                                    req_file.pipe(fs.createWriteStream(require('path').join(__dirname, filename)));

                                    req_file.on('end', function () {
                                        console.log(filename + ' download [OK]');
                                        hwp.open(filename, function(err, doc){
                                            var hml = doc.toHML();
                                            //console.log(hml);

                                            var userFile = jsonfile.readFileSync(userFilePath);     // 사용자 목록 파일 read

                                            for(var j = 0 ; j < userFile.users.length ; ++j) {      // 사용자 수만큼 반복
                                                var key_string = userFile.users[j].key[0];

                                                if(key_string == 'all')     // 처음 키워드가 all 이면 바로 전송
                                                {
                                                    bot.sendMessage(userFile.users[j].id, msg_title + msg_body);
                                                }
                                                else    // 키워드가 존재 하는 경우
                                                {
                                                    var key_flag = false;       // 키워드가 유효하지 않다고 가정..

                                                    msg_keyword = '● 키워드 : ';
                                                    for(var key_num = 0 ; key_num < userFile.users[j].key.length ; ++key_num)   // 키워드 수만큼 반복
                                                    {
                                                        key_string = userFile.users[j].key[key_num];

                                                        var results = hml.match(new RegExp(key_string,"g"));
                                                        if(results != null) {
                                                            key_flag = true;    // 키워드가 하나라도 존재
                                                            msg_keyword += key_string + '(' + results.length + ') ';
                                                            console.log('\'' + key_string + '\'키워드 검색 결과 : ' + results.length); // 2개이므로 2가 출력된다!
                                                        }
                                                    }

                                                    if(key_flag == true)    // 키워드가 하나라도 존재
                                                    {
                                                        msg_keyword += '\n';
                                                        bot.sendMessage(userFile.users[j].id, msg_title + msg_keyword + '\n' + msg_body);
                                                    }

                                                }
                                            }
                                            fs.unlinkSync(filename);        // 파일 삭제
                                        });
                                    });
                                });
                */
                // 첨부파일 다운로드 ------- [끝]










            }
        }

        if(latestIdx !== lastIdx.lastIdx)     // 마지막 게시글 번호 저장
        {
            lastIdx = {lastIdx : latestIdx};
            jsonfile.writeFileSync(lastIdxCompanyPath, lastIdx);

        }
    });

};

function sendMsg(id, msg) {



    console.log(msg.length + " : " + msg);
        //console.log('길이-------------------------------------- : ' + msg.length);

    try{
        bot.sendMessage(id, msg, {
            parse_mode: 'Markdown'
        });
    } catch(e)
    {
        console.error(e);
    }



}

function sendBroadCast(msg){
    var userFile = jsonfile.readFileSync(userFilePath); // 사용자 목록 파일 read

    for(var j = 0 ; j < userFile.users.length ; ++j) {
        sendMsg(userFile.users[j].id, msg)
    }
}
//setInterval(afterschool_for_personal_start, 6000 * 2);

//setInterval(afterschool_for_personal_start, 6000 * 10);
//setInterval(afterschool_for_company_start, 6000 * 10);



afterschool_for_personal_start();
//afterschool_for_company_start();