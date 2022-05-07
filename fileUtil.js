var fs = require('fs');
var path = require("path");

let writeToFile = (data) => {
    for(let key in data) {
        let str = key+" "+data[key].join(',')+"\n";
        fs.appendFile('output.txt', str, function (err) {
            if (err) throw err;
        });
    }
}

module.exports = {
    writeToFile
}