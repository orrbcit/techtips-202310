function saveDataWithTime() {
    //get some data from user
    var input = "important information";
    var currentDate = new Date();  //get current date

    //construct data object as JSON
    var obj = {
        info: input,
        date: currentDate
    }
    //---------------------
    //Save Data
    //---------------------
    writeJSONData(obj);
}
saveDataWithTime();

function writeJSONData(obj) {

    const {
        writeFileSync
    } = require("fs");

    const path = "data.json";

    try {
        writeFileSync(path, JSON.stringify(obj, null, 2), "utf8");
        console.log("Data successfully saved");
    } catch (error) {
        console.log("An error has occurred ", error);
    }
}