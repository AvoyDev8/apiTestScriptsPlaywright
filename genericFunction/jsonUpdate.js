const jsonData = require("D:\\Assignment2\\jsonFiles\\credData.json");
const fs = require("fs");

function jsonUpates(key, value) {

    jsonData[key]=`${value}`;
    fs.writeFileSync("D:\\Assignment2\\jsonFiles\\credData.json",JSON.stringify(jsonData,null,2));
}

module.exports=jsonUpates;
