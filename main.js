var request = require('request');
var requestSync = require('sync-request');
var cheerio = require('cheerio');
var iconv = require('iconv-lite');

var urlbase = "http://bsafterschool.pen.go.kr";      // 부산방과후학교지원센터 페이지
var options = {
    url: urlbase + "/sub.php?MenuID=68",       // 강사모집 페이지
    encoding: null
};


request.get(options, function(error, response, body_buf) {
    if (error) throw error;

    var body = iconv.decode(body_buf, 'EUC-KR');
    var $ = cheerio.load(body);

    var trElements = $("#board-list tbody tr");
    trElements.each(function() {
        //console.log($(this));
        //var postTitle = $(this).find("h1").text();
        //var postUrl = $(this).find("h1 a").attr("href");

        //var tbody = $(this);

        var tbodyArray = $(this).find("td").toArray();

        var idx = $(tbodyArray[0]).text();
        var title = $(tbodyArray[1]).find('a').text();
        var writer = $(tbodyArray[2]).text();
        var start = $(tbodyArray[3]).text();
        var end = $(tbodyArray[4]).text();
        var status = $(tbodyArray[5]).text().replace(/\n/g,'').replace(/\t/g,'');

        var subPageLink = urlbase + $(tbodyArray[1]).find('a').attr('href');

        var res = requestSync('GET', subPageLink);

        var subPage$ = cheerio.load(iconv.decode(res.getBody(), 'EUC-KR'));
        var board_contents = subPage$('td.board_contents p').text().replace(/\n/g,'').replace(/\t/g,'');
        var file = subPage$('td.file a').text();


        console.log("================[내용]=============");
        console.log("번호 : " + idx);
        console.log("제목 : " + title);
        console.log("글쓴이 : " + writer);
        console.log("작성일 : " + start);
        console.log("마감일 : " + end);
        console.log("상태 : " + status);


        console.log("본문내용 : " + board_contents);
        console.log("첨부파일 : " + file);
        console.log("URL : " + subPageLink);
        console.log("==================================");
        console.log("");
        console.log("");




        /*
        for(i in tbodyArray)
        {

            /console.log($(tbodyArray[i]).text());
        }
        */

        
        //console.log(num);

    });


});


