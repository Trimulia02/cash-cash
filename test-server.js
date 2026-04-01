#!/usr/bin/env node

try {
  console.log("Starting server...");
  require("./app.js");
  setTimeout(() => {
    console.log("Server is running OK");
    process.exit(0);
  }, 2000);
} catch (error) {
  console.error("ERROR Starting Server:");
  console.error(error.message);
  console.error(error.stack);
  process.exit(1);
}
