const http = require("http");

const makeRequest = (path, method, body) => {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(body || {});
    const options = {
      hostname: "localhost",
      port: 5000,
      path: path,
      method: method,
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData),
      },
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          resolve({
            status: res.statusCode,
            body: JSON.parse(data),
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            body: data,
          });
        }
      });
    });

    req.on("error", (e) => {
      reject(e);
    });

    req.write(postData);
    req.end();
  });
};

async function runTests() {
  console.log("=== Starting API Input Validation Tests ===\n");

  // Test 1: Missing all fields
  console.log("Test 1: Login with empty body (Expected: 400 Bad Request)");
  try {
    const res = await makeRequest("/api/auth/login", "POST", {});
    console.log(`Status: ${res.status}`);
    console.log(`Response: ${JSON.stringify(res.body, null, 2)}\n`);
  } catch (err) {
    console.error("Connection failed. Make sure your server is running on port 5000.");
    return;
  }

  // Test 2: Invalid Employee ID Format
  console.log("Test 2: Login with invalid employee ID format (Expected: 400 Bad Request)");
  const res2 = await makeRequest("/api/auth/login", "POST", {
    employeeId: "invalid_id_#",
    password: "Password123"
  });
  console.log(`Status: ${res2.status}`);
  console.log(`Response: ${JSON.stringify(res2.body, null, 2)}\n`);

  // Test 3: Short password
  console.log("Test 3: Login with short password (Expected: 400 Bad Request)");
  const res3 = await makeRequest("/api/auth/login", "POST", {
    employeeId: "DIT-EMP-0001",
    password: "123"
  });
  console.log(`Status: ${res3.status}`);
  console.log(`Response: ${JSON.stringify(res3.body, null, 2)}\n`);

  // Test 4: Correct format but wrong credentials (Expected: 401 Unauthorized)
  console.log("Test 4: Correct format but wrong credentials (Expected: 401 Unauthorized)");
  const res4 = await makeRequest("/api/auth/login", "POST", {
    employeeId: "DIT-EMP-9999",
    password: "CorrectFormat123"
  });
  console.log(`Status: ${res4.status}`);
  console.log(`Response: ${JSON.stringify(res4.body, null, 2)}\n`);

  console.log("=== Tests Completed ===");
}

runTests();
