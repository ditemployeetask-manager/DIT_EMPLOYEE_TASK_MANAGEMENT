const https = require("https");
const fs = require("fs");
const path = require("path");

const url = "https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg";
const dest = path.join(__dirname, "../../frontend/src/assets/logos/emblem_of_india.svg");

// Ensure the directory exists
fs.mkdirSync(path.dirname(dest), { recursive: true });

console.log("Downloading emblem from Wikimedia Commons...");
const options = {
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
  }
};
https.get(url, options, (res) => {
  if (res.statusCode !== 200) {
    console.error(`Request Failed. Status Code: ${res.statusCode}`);
    res.resume();
    return;
  }

  const fileStream = fs.createWriteStream(dest);
  res.pipe(fileStream);

  fileStream.on("finish", () => {
    fileStream.close();
    console.log("Download completed successfully!");
  });
}).on("error", (err) => {
  console.error("Error downloading file:", err.message);
});
