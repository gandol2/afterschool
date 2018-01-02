var hwp = require("./node-hwp");
var Promise = require('bluebird');
var fs = require('fs');

/*
var getHWPString = function(){
    return hwp.open('(몸짱스포츠교실)연동초_2018방과후학교프로그램위탁강사재공모.hwp', 'hwp', function(err, doc){

        // var waitTill = new Date(new Date().getTime() + 2 * 1000);
        // while(waitTill > new Date()){}

        return doc.toHML(false);
    });
}


new Promise(function(resolve, reject){
    hwp.open('testfile.hwp', 'hwp', function(err, doc){
        resolve(doc.toHML(false));
    });

})
.then(console.log)
    .catch(console.error)
*/








/*
hwp.open('안락중방과후강사모집공고.hwp', function(err, doc){
    console.log('[★INFO★] : hwp.open() 호출됨 3');
    if(err)
    {
        console.log('[★ERR★] : ' + err);
    }


    var hml = doc.toHML();

    console.log(hml);

    console.log();
    console.log();


    var results = hml.match(/3D/g);
    if(results != null) {
        console.log(results.length); // 2개이므로 2가 출력된다!
    }


    fs.unlinkSync('안락중방과후강사모집공고.hwp');
    //fs.unlinkSync('downloads/' + '2.txt');

//    console.log( hml.includes('제출') );

    //fs.writeFile('test1.html', doc.toHML());
});

*/




var fileUrl = 'http://bsafterschool.pen.go.kr/bbs/download.php?bf_no=18281';

var fs      = require('fs'),
    path    = require('path'),
    request = require('request');


function test_fn() {
    var req_file = request(fileUrl).on('response', function (res) {
        console.log('1. download START');
        var filename = 'downloads/test.hwp';
        var contentDisp = res.headers['content-disposition'];

        var fsw = fs.createWriteStream(path.join(__dirname, filename));
        req_file.pipe(fsw)
            .on('finish', function () {

        }).on('error', function (err) {
            console.log('●●●●●●●●●●●●●●●●●●●●●●●●●●●pipe error ' + err);
        }).on('close', function (close) {
            console.log('2. download OK');



            var data = fs.readFileSync(filename, 'utf16le');
            // wait for the result, then use it
            console.log(data.toString('base64').match(new RegExp('대체강사',"g")));

            // fs.open( filename, 'r', 0666, function(err, fd) {
            //     if( err ) {
            //         self.emit('err', err);
            //         return;
            //     }
            //
            //     self._fd = fd;
            //     callback();
            // });

            /*
            fs.open(filename, 'r', function(err, fd){
                console.log('3. file Open OK ' + fd);

                fs.close(fd, function () {
                    fs.unlinkSync(filename);        // 파일 삭제
                    console.log('4. delete OK');
                })


            });
            */




            // hwp.open(filename, function (err, doc) {
            //     console.log('3. file Open OK');
            //     var hml = doc.toHML();
            //     //console.log(hml);
            //
            //     var results = hml.match(/일/g);
            //     if (results != null) {
            //         console.log('키워드 검색 결과 : ' + results.length); // 2개이므로 2가 출력된다!
            //     }
            //
            //     //fs.unlinkSync(filename);        // 파일 삭제
            //     // var del = require('delete');
            //     // del.sync([filename]);
            //
            //     fs.closeSync(doc._doc['_fd']);
            //     console.log('4. file close OK');
            //
            //     fs.unlinkSync(doc._doc['_filename']);
            //     console.log('5. file delete OK \n');
            //
            //     /*
            //     fs.close(doc._doc['_fd'], function () {
            //         fs.unlinkSync(filename);        // 파일 삭제
            //         console.log('4. delete OK');
            //     })
            //     */
            //
            //     //fs.unlinkSync(filename);        // 파일 삭제
            //     //console.log('4. delete OK');
            //
            // });



        })
    });
}


setInterval(test_fn, 6000);


