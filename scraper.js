const fs = require('fs');

// Requires x-ray, which scrapes websites for their html
const Xray = require('x-ray');
const x = Xray();

// Requires json2csv to convert our data to a CSV file, defines CSV fields
var json2csv = require('json2csv');
var fields = ['Title', 'Price', 'ImageURL', 'URL', 'Time'];

const dataFolder = './data';

// Check for data folder
function checkDirectory(folder){
  if (!fs.existsSync(folder)){
    fs.mkdirSync(folder);
  } else {
    // don't do anything.
  }
}
checkDirectory(dataFolder);

// HELPERS
// -- Formatting date and time used in CSV and error files
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

// ERROR FUNCTION
// -- Logs a readable message to the console.
// -- Creates Time stamp, formats error
// -- Creates scraper-log file if one does not exist, appends error
function printError(error) {
  if (error.code === "ENOTFOUND") {
    console.error(`There's been a 404 error. Cannot connect to Shirts 4 Mike.`)
  } else {
    console.error(`There has been an error with creating your file. Error code: ${error.code}`);
  }
  let currentTime = new Date();
  let errorAppend = `[${currentTime}] Error code: ${error.code}\n`;
  if (!fs.existsSync('scraper-error.log')){
    fs.writeFile('scraper-error.log', '', (error) => {
      fs.appendFileSync('scraper-error.log', errorAppend);
    });
  } else {
    fs.appendFileSync('scraper-error.log', errorAppend);
  };
};

// SCRAPER
// -- Use x-ray to scrape shirts4mike and build each object for the CSV
// -- Sets the Title, Price, ImageURL, URL, and Time of scrape
x('http://shirts4mike.com/shirts.php', '.products li', [{
  'Title': 'img@alt',
  'Price': x(`a@href`, '.price'),
  'ImageURL': 'img@src',
  'URL': 'a@href'
  }])(function(error, shirts) {
    if(!error){
      for(let i= 0; i <= (shirts.length-1); i++){
        shirts[i].Time = getTime();
      }
      // Add objects to CSV file with json2csv
      try {
        var csv = json2csv({ data: shirts, fields: fields });
      } catch (error) {
        printError(error);
      }
      // Writes (or rewrites) the CSV file with most recent data within the data folder
      fs.writeFile(`./data/${getDate()}.csv`, csv, function(error) {
        if (error) {
          printError(error);
        } else {
          console.log('Your new CSV file of shirts4mike.com has been saved.');
        }
      });
    } else {
      printError(error);
    };
});
