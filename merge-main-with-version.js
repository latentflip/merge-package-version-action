// Using git and child_process.exec_sync determine the version in package.json on the main branch
const { execSync } = require("child_process");
const execSyncString = (cmd) => execSync(cmd).toString().trim();

const pwd = execSyncString("pwd");

const mainBranchPackageJsonContents = execSyncString(
  "git show main:package.json"
);
const version = JSON.parse(mainBranchPackageJsonContents).version;
console.log(version);

// Find the commit sha that had the version as the text in the commit message
const commitSha = execSyncString(
  `git log main --grep="^${version}$" --format="%H" -1`
);
console.log("Sha:", commitSha);

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

// Cherry-pick the version bump from main
execSync(`git cherry-pick ${commitSha} --strategy-option theirs`);

execSync("git merge main");

// Update the version in package.json
execSync(`npm version ${bump}`);
