const core = require("@actions/core");
const github = require("@actions/github");
const { execSync } = require("child_process");

try {
  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2);
  console.log(`The event payload: ${payload}`);
} catch (error) {
  core.setFailed(error.message);
}

try {
  console.log(execSync("ls"));
  console.log(execSync("git status"));
} catch (error) {
  core.setFailed(error.message);
}
