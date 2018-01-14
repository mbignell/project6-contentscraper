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

function printError(error) {
  console.log(error.message);
  try {
    let currentTime = new Date();
    let errorAppend = `[ ${currentTime} ] ${error.message}`
    fs.appendFileSync('scraper-error.log', errorAppend);
    console.log('The error was appended to file!');
  } catch (err) {
    console.log('something wasnt appended shoot');
  }
}

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
    // Add objects to CSV file with json2csv
    try {
      var csv = json2csv({ data: shirts, fields: fields });
    } catch (error) {
      // Errors are thrown for bad options, or if the data is empty and no fields are provided.
      // Be sure to provide fields if it is possible that your data array will be empty.
      printError(error);
    }
    // Writes (or rewrites) the CSV file with most recent data within the data folder
    fs.writeFile(`./data/${getDate()}.csv`, csv, function(error) {
      if (error) throw error;
      console.log('file saved');
    });
})

// TO DO

// When an error occurs, log it to a file named scraper-error.log .
//It should append to the bottom of the file with a time stamp and error e.g.
//[Tue Feb 16 2016 10:02:12 GMT-0800 (PST)] <error message>

//If http://shirts4mike.com is down, an error message describing the issue should appear in the console.
  // The error should be human-friendly, such as “There’s been a 404 error. Cannot connect to the to http://shirts4mike.com.”
  // To test and make sure the error message displays as expected, you can disable the wifi on your computer or device.
