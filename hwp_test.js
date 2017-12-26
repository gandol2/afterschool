var hwp = require("./node-hwp");
var fs = require('fs');
hwp.open('file.hwp', function(err, doc){
    var hml = doc.toHML();

    console.log(hml);

    console.log();
    console.log();


    var results = hml.match(/3D/g);
    if(results != null) {
        console.log(results.length); // 2개이므로 2가 출력된다!
    }

//    console.log( hml.includes('제출') );

    //fs.writeFile('test1.html', doc.toHML());
});