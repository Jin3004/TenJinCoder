const http = require('http');
const fs = require('fs');
const querystring = require('querystring');
const StringDecoder = require('string_decoder').StringDecoder;
const decoder = new StringDecoder('utf8');
const execSync = require('child_process').execSync;
const os = require("os");
const uuid = require("uuid");
//Import the necessary modules.

const document_root = "../";
const server_root = __dirname;
const forbitten_files = ["password.txt", "token.txt", "server.js"];
const isWindows = os.type().toString() === "Windows";
//Whether the environment this app runs is Windows or not.
//Declare constant variables.

const ExistFile = (filename) => {
    try {
        fs.statSync(filename);
        return true;
    } catch (err) {
        if (err === "ENOENT") {
            return false;
        }
    }
};

const Judge = (received) => {
    let codename = "";
    {
        let max = -1;
        const files = fs.readdirSync('../users/' + received["user"] + "/submission");
        files.forEach((file) => {
            let filename = file.split('.')[0];
            try{
                max = Math.max(max, Number(filename));
            }catch(err){
                console.error("Cannot convert the codename: " + file);
            }
        });
        codename = (max <= 8) ? ('0' + (max + 1)) : (max + 1);
    }//Get codename.
    
    {
        process.chdir("../users/" + received["user"] + "/submission");
        fs.writeFileSync(codename + ".cpp", received["code"], (err, data) => {console.error(err);});
        //Create the source file.
        process.chdir("../../../bin");
        let cmd = "";
        cmd += isWindows ? "judge.exe " : "./judge ";
        cmd += received["prob"] + " " + received["user"] + " " + received["limitedTime"] + " " + codename;
        const stdout = execSync(cmd).toString();
        //Run the command.
        process.chdir("../users/" + received["user"] + "/submission");
        fs.writeFileSync(codename + ".txt", stdout, (err, data) => {console.error(err);});

        let result = "";
        {
            const resarr = ["AC", "WA", "TLE", "RE", "CE"];
            let val = 0;
            for(let o of stdout){
                val = Math.max(val, Number(o));
            }
            result = resarr[val];
        }
        let text = fs.readFileSync("../json/results.json", "utf-8", (err, data) => {console.error(err);});
        let json = JSON.parse(text);
        json.results.push({user: received["user"], result: result, problem: received["prob"], codeName: codename});
        text = JSON.stringify(json);
        fs.writeFileSync("../json/results.json", text, (err, data) => {console.error(err);});

        process.chdir(server_root);
    }//Run the binary file to judge.

    return 0;
}

const MakeAccount = (received) => {
    const username = received["username"];
    const password = received["password"];
    process.chdir("../users");
    if(ExistFile(username))return -1;//Cannot make his account.
    else{
        fs.mkdir(username, (err, folder) => {console.error(err);});
        process.chdir(username);
        fs.mkdir("config", (err, folder) => {console.error(err);});
        fs.mkdir("submission", (err, folder) => {console.error(err);});
        process.chdir("config");
        fs.writeFileSync("password.txt", password, (err, data) => {console.error(err);});
        process.chdir(server_root);

        return 0;
    }
};

const Login = (received) => {
    const username = received["username"];
    const password = received["password"];
    process.chdir("../users");
    if(!ExistFile(username)){
        process.chdir(server_root);
        return 1;
    }else{
        process.chdir(username);
        process.chdir("config");
        const correct_password = fs.readFileSync("password.txt", "utf-8", (err, data) => {console.error(err);});
        process.chdir(server_root);
        if(correct_password === password)return 0;//Can log in.
        else return 2;//Cannot.
    }
};