let readline = require('linebyline');
const movieTheater = require('./Theater');
const fileUtil = require('./fileUtil');

let args = process.argv;
if (args.length > 2) {
    try {
        let inputFile = args[2];
        let rl = readline(inputFile);
        rl.on('line', function (nextReservation, lineCount, byteCount) { //{R001 2}
            //console.log(nextReservation);
            let output = movieTheater.fillReservation(nextReservation);
            // console.log('Counter::' + lineCount); 
            console.log(movieTheater.getResults());
            console.log("=================================================================");
            if (output == -2) {
                console.log("Invalid number of Seats " + nextReservation);
            }
            if (output == -1) {
                console.log("Sorry, cannot process request due to Insufficient seats" + nextReservation);
            }
        });
        setTimeout(() => {
            // movieTheater.getSeatMap();
            fileUtil.writeToFile(movieTheater.getResults());
            console.log(__dirname + '/output.txt');
        }, 2000);
    } catch (error) {
        console.log('Error : ' + error);
    }
} else {
    console.log('Give file name as an argument!');
}


