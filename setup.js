/* eslint-disable */
const exec = require('child_process').exec;
const fs = require("fs");

const dirConfig = './src/logs';


console.info("****** Checking Node version ....");
const nodeNumVersion = parseFloat(process.version.slice(1))


console.info('*** Node version :', process.version);
if (nodeNumVersion < 7) {
    console.error('!!!!!!!! This app  requires node v7 or greater.');
    console.error('!!!!!!!! Update your node version to at least v6.9.5.');
    process.exit(1);
}

console.info("****** Creating Logs folder ....");
fs.mkdir(dirConfig, function (err, folder) {
    if (err) {
        if (err.code === "EEXIST") {
            console.info(`*** The folder '${dirConfig}' already exists`);
        } else {
            if (err.code === 'EPERM' || err.code === 'EACCES') {
                console.error('!!!!!!!! Cannot create folder. Must be admin to.');
            } else {
                console.error(err.message);
            }
            process.exit(err.errno);
        }
    }
    console.info("*** Logs folder created");
});

console.info('****** Installing packages dependencies ....');
exec('npm install', function (err, version) {
    if (err) throw err;
    console.info("*** npm packages Installed");
    console.info("*** Setup completed.");
});