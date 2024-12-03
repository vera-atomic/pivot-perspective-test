const fs = require("fs");
const path = require("path");
const Papa = require("papaparse");

const modifyOrderPlacedDate = (dateString) => {
  if (dateString) {
    const date = new Date(dateString);
    date.setUTCDate(1); // Set the date to the first day of the month (in UTC)
    const isoString = date.toISOString().split("T")[0]; // Format the date as YYYY-MM-DD
    return isoString;
  }
  return null;
};

// Function to transform the CSV data
const transformCSV = (csvData) => {
  const parsedData = Papa.parse(csvData, { header: true });

  // Filter out rows where any value is missing
  const cleanedData = parsedData.data.filter((row) => {
    return Object.values(row).every(
      (value) => value !== undefined && value !== null && value.trim() !== ""
    );
  });

  // Transform each row of data as per the requirements
  const formattedData = cleanedData
    .map((row) => ({
      sku: row.sku,
      location: Math.random() < 0.5 ? "Europe" : "USA", // Randomly assign 'Europe' or 'USA'
      channel: row.channel,
      order_placed_date: modifyOrderPlacedDate(row.order_placed_date), // Set date to the first of the month
      quantity: parseFloat(row.quantity),
      revenue: parseFloat(row.revenue),
      id: parseInt(row.id, 10),
    }))
    .filter((row) => row.sku);

  return formattedData;
};

// Read CSV file and write the transformed data back to a new CSV
const inputCsvFile = path.join(__dirname, "demand.csv");
const outputCsvFile = path.join(__dirname, "normalized_demand.csv");

fs.readFile(inputCsvFile, "utf8", (err, csvData) => {
  if (err) {
    console.error("Error reading the CSV file:", err);
    return;
  }

  const transformedData = transformCSV(csvData);

  // Convert the transformed data back to CSV format
  const csvOutput = Papa.unparse(transformedData);

  // Write the transformed data to a new CSV file
  fs.writeFile(outputCsvFile, csvOutput, (err) => {
    if (err) {
      console.error("Error writing the transformed CSV file:", err);
    } else {
      console.log(
        "CSV transformation complete. Output saved to:",
        outputCsvFile
      );
    }
  });
});
