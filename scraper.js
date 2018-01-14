const fs = require('fs');

// Requires x-ray, which scrapes websites for their html
const Xray = require('x-ray');
const x = Xray();

// Requires json2csv to convert our data to a CSV file, defines CSV fields
var json2csv = require('json2csv');
var fields = ['Title', 'Price', 'ImageURL', 'URL', 'Time'];

const dataFolder = './data';

//check for data folder
function checkDirectory(folder){
  if (!fs.existsSync(folder)){
    fs.mkdirSync(folder);
  } else {
    // don't do anything.
  }
}
checkDirectory(dataFolder);

function getDate() {
  var today = new Date();
  let year = today.getFullYear();
  let month = (today.getMonth() + 1);
  let day = today.getDate();
  let date = `${year}-${month}-${day}`;
  return date;
}

function getTime() {
  let today = new Date();
  let hours = today.getHours();
  let minutes = today.getMinutes();
  let seconds = today.getSeconds();
  let time = (("" + hours).length < 2 ? "0" : "") + hours + ":";
    time += (("" + minutes).length < 2 ? "0" : "") + minutes + ":";
    time += (("" + seconds).length < 2 ? "0" : "") + seconds;
  return time;
}

// Error testing
// printError({message : 'newone'});

// Error function to use whenever an error occurs.
// Creates Time stamp, formats error
// creates file if one does not exist
// appends error
function printError(error) {
  let currentTime = new Date();
  let errorAppend = `[ ${currentTime} ] ${error.message} and ${error.response}\n`;
  if (!fs.existsSync('scraper-error.log')){
    fs.writeFile('scraper-error.log', '', (error) => {
      fs.appendFileSync('scraper-error.log', errorAppend);
    });
  }else {
    fs.appendFileSync('scraper-error.log', errorAppend);
  };
};

// Testing time
let currentTime = getTime();

// Use x-ray to scrape shirts4mike and build each object for the CSV
// Sets the Title, Price, ImageURL, URL, and TIME???
x('http://shirts4mike.com/shirts.php', '.products li', [{
  'Title': 'img@alt',
  'Price': x(`a@href`, '.price'),
  'ImageURL': 'img@src',
  'URL': 'a@href'
  // how to add current time here? for example, I have attempted:
  // 'Time': getTime()
  // 'Time': currentTime (variable above)
  }])(function(error, shirts) {
    // Adding date to each item and editing title to remove price
    // this adds it after the fact, yeah? how to do during processing?
    if(!error){
      for(let i= 0; i <= (shirts.length-1); i++){
        shirts[i].Time = getTime();
      }
      // Add objects to CSV file with json2csv
      try {
        var csv = json2csv({ data: shirts, fields: fields });
      } catch (error) {
        // Errors are thrown for bad options, or if the data is empty and no fields are provided.
        // Be sure to provide fields if it is possible that your data array will be empty.
        let newError = new Error();
        printError(newError);
      }
      // Writes (or rewrites) the CSV file with most recent data within the data folder
      fs.writeFile(`./data/${getDate()}.csv`, csv, function(error) {
        if (error) throw error;
        console.log('file saved');
      });
    } else {
      //If http://shirts4mike.com is down,
      // an error message describing the issue should appear in the console.
      // Else, normal error log.
      if (error.response === 404) {
        console.error(`There's been a 404 error OH NO! Cannot connect to Shirts 4 Mike.`)
        printError(error);
      } else {
        console.error(error);
        console.log(error.response);
        // this is logging with an undefined response???????
        //
        // FIX
        //
        printError(error);
      };
    };
});
