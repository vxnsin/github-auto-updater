//https://github.com/vxnsin/github-auto-updater/ 
// Made by Vxnsin 
//Discord: vxnsin

const fs = require('fs');
const { spawn } = require('child_process');
const fetch = require('node-fetch');
const tar = require('tar');

// GitHub Token (make sure to keep this secret)
const GITHUB_TOKEN = 'your_github_token_here'; // Replace with your GitHub token

// GitHub Repository Information
const owner = 'GITHUB_USER'; // GitHub username or organization name
const repo = 'REPOSITORY'; // Repository name
const branch = 'main'; // Change this according to your repo's main branch name

// URL for downloading the repository archive
const repoUrl = `https://api.github.com/repos/${owner}/${repo}/tarball/${branch}`;

// Target folder for downloading the repo
const downloadFolder = './'; // Set the download folder here

// Files to ignore during extraction
const ignoreList = ['update.js'];

// Call the script with execution flag and file path
const executeProcess = false; // Set to true to execute the process
const filePath = './FILEPATH'; // Specify the file path to execute

// Function to download and extract the repo
async function downloadAndExtractRepo(executeProcess = false, filePath = '') {
    try {
        console.log('⚙️  | Downloading the repository...');
        const response = await fetch(repoUrl, {
            headers: {
                Authorization: `token ${GITHUB_TOKEN}`
            }
        });

        // Check if the response is OK
        if (!response.ok) {
            throw new Error(`❌  | Error downloading the repository: ${response.status} ${response.statusText}`);
        }

        // Create the target folder if it doesn't exist
        if (!fs.existsSync(downloadFolder)) {
            fs.mkdirSync(downloadFolder);
        }

        // Save the downloaded archive
        const repoArchive = await response.buffer();
        fs.writeFileSync(`${downloadFolder}/repo.tar.gz`, repoArchive);

        // Extract the archive while ignoring specified files
        await tar.extract({
            file: `${downloadFolder}/repo.tar.gz`,
            cwd: downloadFolder,
            strip: 1,
            filter: (path) => {
                return !ignoreList.some(item => path.includes(item));
            }
        });

        console.log('✅  | Repository successfully downloaded and extracted.');

        // Remove the archive
        fs.unlinkSync(`${downloadFolder}/repo.tar.gz`);

        // Execute the specified file if the flag is true
        if (executeProcess && filePath) {
            console.log('🤖  | Starting the process...');
            console.log('---------------------------------------------');
            const botProcess = spawn('node', [filePath], { stdio: 'inherit' });

            // Handle the bot process exit
            botProcess.on('exit', (code, signal) => {
                console.log(`🛑  | The process has ended (Exit Code: ${code || signal})`);
            });
        } else {
            console.log(':warning:  | No process will be executed. Set executeProcess to true and provide a valid file path.');
        }
    } catch (error) {
        console.error(error);
    }
}

// Execute the function
downloadAndExtractRepo(executeProcess, filePath);
