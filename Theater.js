//global class variables
let rows = 10, col = 20;
totalSeats = rows * col, bufferSeats = 3, bufferRows = 1;
let seatsRemaining = new Array(10).fill(col); // for every row no of empty seats is maintained.
let seatChart = {};
let seatMap = new Array(rows).fill(false).map(() => new Array(col).fill(false));

let fillReservation = (res) => {
    let booking = res.split(" ");
    let seatsRequested = booking[1]; // no of seats to be booked
    let resNum = booking[0]; // reservation id
    // if there are people in the reservation
    if (seatsRequested > 0) {
        // if the number of seats requested is less than or equal to the number of total seats
        if (totalSeats >= seatsRequested) {
            if (seatsRequested > 20) {
                let val = 0;
                while (seatsRequested > 20) {
                    val = assignSeats(resNum, 20);
                    seatsRequested -= 20;
                }
                return val;
            }
            return assignSeats(resNum, seatsRequested);
        } else {
            return -1;
        }
    }
    return -2;
}

let assignSeats = (resNum, seatsRequested) => {
    let totalSeatsNeeded = seatsRequested;
    let bookSeats = [];
    // console.log(seatsRemaining);
    if (seatsRequested <= totalSeats) {
        // looping through the rows
        for (let rowIndex = rows - 1; rowIndex > 0; rowIndex--) {
            //find out if the row has enough seat using seatsRemaining array
            if (seatsRemaining[rowIndex] >= seatsRequested) {
                // see if they can sit together
                let availSeats = findSeatsTogether(seatsRequested, rowIndex);
                if (availSeats[0] != -1) {
                    let lastSeat;
                    lastSeat = parseInt(availSeats[1]) + parseInt(seatsRequested) - 1;
                    console.log("Avail seats :::: row = " + availSeats[0] + " || Number of seats:" + availSeats[1] + " || Last Seat :" + lastSeat);
                    //must add one as arrays.fill toIndex is exclusive not inclusive
                    seatMap[availSeats[0]].fill(true, availSeats[1], lastSeat + 1); // fill the seats from start index to last index(filling the actual seats taken by the user)
                    console.log("After filling seats :");
                    console.log(getSeatMap());
                    fillBuffer(availSeats[0], availSeats[1], seatsRequested, lastSeat); // to maintain safety
                    console.log("After filling buffer seats :");
                    console.log(getSeatMap());
                    seatsRemaining[availSeats[0]] -= seatsRequested;
                    console.log("Seats Remaining:");
                    console.log(seatsRemaining);
                    totalSeats -= seatsRequested;
                    if (!seatChart.hasOwnProperty(resNum)) {
                        seatChart[resNum] = [];
                    }
                    let counter = 0;
                    while (counter < totalSeatsNeeded) {
                        seatChart[resNum].push(String.fromCharCode(availSeats[0] + 65) + (counter + availSeats[1] + 1).toString());
                        counter++;
                    }
                    return 0;
                } else { //they must split up
                    let splitRow = rows - 1;
                    while (totalSeatsNeeded > 0 && splitRow > 0) {
                        if (seatsRemaining[splitRow] > 1) {
                            for (let findSeat = 0; findSeat < col - 1; findSeat++) {
                                if (!seatMap[splitRow][findSeat]) {
                                    seatMap[splitRow][findSeat] = true;
                                    //for future buffer
                                    bookSeats.push(splitRow + " " + findSeat);
                                    if (!seatChart.hasOwnProperty(resNum)) {
                                        seatChart[resNum] = [];
                                    } else {
                                        seatChart[resNum].push(String.fromCharCode(splitRow + 65) + (findSeat + 1).toString());
                                    }
                                    totalSeats--;
                                    seatsRemaining[splitRow]--;
                                    totalSeatsNeeded--;
                                }
                            }
                        }
                        splitRow--;
                    }
                    separateSeatsBuffer(bookSeats); // to maintain safety filling the seats 
                }
            }
        }
        return 0;
    }
    return -1; //insufficient no of seats.
}

let findSeatsTogether = (seatsRequested, rowIndex) => {
    let result = [-1, -1];
    for (let rowOk = rowIndex; rowOk >= 0; rowOk--) {
        if (seatsRemaining[rowOk] > seatsRequested) { // enough seats in row
            let seatCountRemaining = seatsRequested;
            let seatCounter = 0;
            while (seatCountRemaining > 0) { // this row has the number of seats but can group sit together
                if (seatMap[rowOk][seatCounter]) {       //someones already there so reset counters
                    seatCountRemaining = seatsRequested;
                } else {
                    seatCountRemaining--;
                }
                if (seatCounter != col - 1) { // not at the end of the row
                    seatCounter++; // keep moving coloumn wise in the same row
                } else {
                    break;
                }
            }
            if (seatCountRemaining == 0) { // we found seats so pass back values
                result[0] = rowOk;
                result[1] = seatCounter - seatsRequested; //start index from where the user sits.
                return result;
            }
        }
    }
    return result;
}

let separateSeatsBuffer = (bookSeats) => {
    bookSeats.forEach(seatBooked => {
        let seat = seatBooked.split(" ");
        let gotCol = seat[1];
        let gotRow = seat[0];

        let rowCounter = 1;
        while (rowCounter < bufferRows && gotRow - rowCounter > rows) {
            let rowUp = gotRow + rowCounter;
            let rowBelow = gotRow - rowCounter;
            if (rowUp <= rows - 1 && !seatMap[rowUp][gotCol]) {
                seatMap[rowUp][gotCol] = true;
            }
            if (rowBelow >= 0 && !seatMap[rowBelow][gotCol]) {
                seatMap[rowBelow][gotCol] = true;
            }
            rowCounter++;
            //else its a group member
        }
        let colCounter = 1;
        while (colCounter < bufferSeats && gotCol - colCounter >= col) {
            let seatL = gotCol + colCounter;
            let seatR = gotCol - colCounter;
            if (seatR <= col && seatMap[gotRow][seatR] == null) {
                seatMap[gotRow][seatR] = true;
            }
            if (seatL >= 0 && seatMap[gotRow][seatL] == null) {
                seatMap[gotRow][seatL] = true;
            }
            rowCounter++;
            //else its a group member
        }
    });
}

let fillBuffer = (rowIdx, colIdx, seatsRequested, lastSeat) => {
    //row buffer
    for (let numrows = 1; numrows <= bufferRows; numrows++) {
        if (rowIdx - numrows > 0) {
            for (let safety = 0; safety < seatsRequested; safety++) {
                seatMap[rowIdx - numrows][colIdx + safety] = true;
                seatsRemaining[rowIdx - numrows] -= 1;
                totalSeats -= 1;
            }
        }
        if (numrows + rowIdx < rows - 1) {
            for (let safety = 0; safety < seatsRequested; safety++) {
                seatMap[rowIdx + numrows][colIdx + safety] = true;
                seatsRemaining[rowIdx + numrows] -= 1;
                totalSeats -= 1;
            }
        }
    }

    for (let j = 1; j <= bufferSeats; j++) {
        if (j + lastSeat <= col - 1) {
            seatMap[rowIdx][lastSeat + j] = true;
            seatsRemaining[rowIdx] -= 1;
            totalSeats -= 1;
        }
        if (colIdx - j >= 0 && !seatMap[rowIdx][colIdx - j]) {
            seatMap[rowIdx][colIdx - j] = true;
            seatsRemaining[rowIdx] -= 1;
            totalSeats -= 1;
        }
    }
}

let getResults = () => seatChart;

let getTotalSeats = () => totalSeats;

let getSeatMap = () => {
    for (let i = 0; i < rows; i++) {
        let a = seatMap[i].join('   ');
        console.log(a);
    }

}

module.exports = {
    fillReservation,
    assignSeats,
    findSeatsTogether,
    fillBuffer,
    getResults,
    getTotalSeats,
    getSeatMap
}
