const fs = require('fs');
const csvParser = require('csv-parser');
const ogs = require('open-graph-scraper');

// Returns a Promise that resolves after "ms" Milliseconds
const timer = ms => new Promise(res => setTimeout(res, ms))

async function getImageURL(nameFirst, nameLast) {
  const url = `https://en.wikipedia.org/wiki/${nameFirst}_${nameLast}`;

  try {
    const data = await ogs({ url: url });
    const { error, html, result, response } = data;
    
    if (!result.ogImage) {
      console.log('no img');
      return '';
    } else {
      console.log(result.ogImage[0].url);
      return result.ogImage[0].url;
    }
  } catch (error) {
    console.log(error);
    // throw error;
  }
}


// Function to update the CSV file with the "image" column
async function updateCSVWithImage(csvPath) {
  const rows = [];
  const headers = []; // To store the original column names

  try {
    const csvStream = fs.createReadStream(csvPath).pipe(csvParser());

    const fetchImageURLsPromises = [];

    for await (const row of csvStream) {
      await timer(3000);
      if (headers.length === 0) {
        // Store the original column names in the headers array
        headers.push(...Object.keys(row));
      }

      const imageURLPromise = getImageURL(row['nameFirst'], row['nameLast']);

      // Add the promise to the array
      fetchImageURLsPromises.push(imageURLPromise);

      rows.push(row);
    }

    // Wait for all the image URLs to be fetched
    const imageUrls = await Promise.all(fetchImageURLsPromises);

    // Update the rows with the fetched image URLs
    rows.forEach((row, index) => {
      row['image'] = imageUrls[index];
    });

    // Write the updated data back to the CSV file
    headers.push('image')
    const updatedCSV = [headers, ...rows.map((row) => Object.values(row))];
    const csvData = updatedCSV.map((row) => row.join(',')).join('\n');

    // Append the column headers if not present in the CSV
    // const csvData = headers.includes('image') ? joinedCSV : `${joinedCSV},image`;

    fs.writeFileSync(csvPath, csvData);

    console.log('CSV file updated with image URLs.');
  } catch (error) {
    console.error('Error occurred while processing the CSV:', error);
  }
}

// Call the function with the path to your CSV file
updateCSVWithImage('data-qualified-hitters-4.csv');
