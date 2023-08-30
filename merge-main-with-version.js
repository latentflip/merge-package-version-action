const core = require("@actions/core");
const github = require("@actions/github");

// Using git and child_process.exec_sync determine the version in package.json on the main branch
const { execSync } = require("child_process");
const execSyncString = (cmd) => execSync(cmd).toString().trim();

try {
  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2);
  console.log(`The event payload: ${payload}`);
} catch (error) {
  core.setFailed(error.message);
}

const pwd = execSyncString("pwd");
console.log(pwd);

const mainBranchPackageJsonContents = execSyncString(
  "git show main:package.json"
);
const version = JSON.parse(mainBranchPackageJsonContents).version;
console.log(version);

// Get the current version on our feature branch
const currentVersion = require(pwd + "/package.json").version;
console.log("Current version:", currentVersion);

// Get the version of the package.json at the merge-base between the current branch and main
const mergeBasePackageJsonContents = execSyncString(
  `git show $(git merge-base main HEAD):package.json`
);
const mergeBaseVersion = JSON.parse(mergeBasePackageJsonContents).version;
console.log("Merge base version:", mergeBaseVersion);

// Calculate the type of version bump between currentCommitSha and mergeBaseVersion
const semver = require("semver");
const bump = semver.diff(mergeBaseVersion, currentVersion);
console.log("Bump:", bump);

// overwrite with main version
execSync(`npm version ${version} --no-git-tag-version`);
execSync(`git add package.json`);
try {
  execSync(`git add package-lock.json`);
} catch (e) {}
execSync(`git commit -m "revert version to ${version}"`);

execSync("git merge main");

// Update the version in package.json
execSync(`npm version ${bump} --no-git-tag-version`);
execSync(`git add package.json`);
try {
  execSync(`git add package-lock.json`);
} catch (e) {}
execSync(`git commit -m "update version to ${version}"`);
execSync(`git log`);
execSync(`git diff main`);
