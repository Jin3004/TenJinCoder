//const Cookie = require("./../library/js.cookie-2.2.1.min.js");
const http = require('http');
const fs = require('fs');
const querystring = require('querystring');
const StringDecoder = require('string_decoder').StringDecoder;
const decoder = new StringDecoder('utf8');
const execSync = require('child_process').execSync;
const os = require("os");
//Import the necessary modules.

const server = http.createServer();
const server_root = __dirname;
const document_root = server_root + "/../";
const forbitten_files = ["password.txt", "token.txt", "server.js"];
const mime_type = new Map([["html", "text/html"], ["css", "text/css"], ["js", "text/javascript"], ["json", "application/json"], ["ico", "image/ico"], ["txt", "text/plain"], ["cpp", "text/plain"]]);
//Whether the environment this app runs is Windows or not.
//Declare constant variables.


const ToAbsolute = (file) => {//Convert the given path to absolute path.
    return document_root + file;
}

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

const CreateUUID = () => {
    let chars = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".split('');
    for (let i = 0, len = chars.length; i < len; i++) {
        switch (chars[i]) {
            case 'x':
                chars[i] = Math.floor(Math.random() * 16).toString(16);

        }
        if (chars[i] === 'x') chars[i] = Math.floor(Math.random() * 16).toString(16);
        else if (chars[i] === 'y') chars[i] = Math.floor(Math.random() * 4 + 8).toString(16);
    }
    return chars.join('');
};

const Judge = (received, request, response) => {
    let cookie = new Map();
    {
        let string = request.headers.cookie;
        console.log("the current cookie: ", string);
        let tmp = string.split("; ");
        for (let t of tmp) {
            let first = t.split('=')[0], second = t.split('=')[1];
            cookie.set(first, second);
        }
    }//Parse the cookie.
    {
        data = fs.readFileSync(ToAbsolute("users/" + received["user"] + "/config/token.txt"), { encoding: "utf-8" });
        if (data != cookie.get("token")) {
            fs.appendFileSync("log.txt", "[ILLEGAL_LOGIN]: Detect illegal login(@" + received["user"] + ")", (err, data) => { console.error(err); });
            return 1;//Illegal login.
        }
    }//Check if the token is correct or not.
    let codename = "";
    {
        let max = -1;
        const files = fs.readdirSync(ToAbsolute("users/" + received["user"] + "/submission"));
        files.forEach((file) => {
            let filename = file.split('.')[0];
            try {
                max = Math.max(max, Number(filename));
            } catch (err) {
                console.error("Cannot convert the codename: " + file);
            }
        });
        codename = (max <= 8) ? ('0' + (max + 1)) : (max + 1);
    }//Get codename.

    {
        process.chdir(ToAbsolute("users/" + received["user"] + "/submission"));
        fs.writeFileSync(codename + ".cpp", received["code"], (err, data) => { console.error(err); });
        //Create the source file.
        process.chdir("../../../bin");
        let cmd = "";
        cmd += "./judge ";
        cmd += received["prob"] + " " + received["user"] + " " + received["limitedTime"] + " " + codename;
        const stdout = execSync(cmd).toString();
        //Run the command.
        process.chdir("../users/" + received["user"] + "/submission");
        fs.writeFileSync(codename + ".txt", stdout, (err, data) => { console.error(err); });

        let result = "";
        {
            const resarr = ["AC", "WA", "TLE", "RE", "CE"];
            let val = 0;
            for (let o of stdout) {
                val = Math.max(val, Number(o));
            }
            result = resarr[val];
        }
        //fs.appendFileSync(ToAbsolute("json/results.json"), JSON.stringify({ user: received["user"], result: result, problem: received//["prob"], codeName: codename }), (err, data) => {console.error(err);});
        let txt = fs.readFileSync(ToAbsolute("json/results.json"), "utf-8", (err, data) => { });
        let json = JSON.parse(txt);
        json.results.push({ user: received["user"], result: result, problem: received["prob"], codeName: codename });
        txt = JSON.stringify(json);
        fs.writeFileSync(ToAbsolute("json/results.json"), txt, (err, data) => { });

        process.chdir(server_root);
    }//Run the binary file to judge.

    return 0;
}

const MakeAccount = (received, request, response) => {

    const username = received["username"];
    const password = received["password"];
    process.chdir(ToAbsolute("users"));
    if (ExistFile(username)) return -1;//Cannot make his account.
    else {
        fs.mkdirSync(username, (err, folder) => { console.error(err); });
        process.chdir(username);
        fs.mkdirSync("config", (err, folder) => { console.error(err); });
        fs.mkdirSync("submission", (err, folder) => { console.error(err); });
        process.chdir("config");
        fs.writeFileSync("password.txt", password, (err, data) => { console.error(err); });
        const token = CreateUUID();
        fs.writeFileSync("token.txt", token, (err, data) => { console.error(err); });
        process.chdir(server_root);

        //response.headers.cookie("user", username, {path: '/'});
        //response.headers.cookie("token", token, {path: '/'});

        //console.log(Cookie.get());

        return token;
    }
};

const Login = (received, request, response) => {
    const username = received["username"];
    const password = received["password"];
    process.chdir(ToAbsolute("users"));
    if (!ExistFile(username)) {
        process.chdir(server_root);
        return 1;
    } else {
        process.chdir(username);
        process.chdir("config");
        const correct_password = fs.readFileSync("password.txt", "utf-8", (err, data) => { console.error(err); });
        process.chdir(server_root);
        if (correct_password === password){
            let data = fs.readFileSync(ToAbsolute("users/" + username + "/config/token.txt"), {encoding: "utf-8"});
            return data;
        }//Can log in.
        else return 2;//Cannot.
    }
};

const MakeProblem = (received, request, response) => {

    let cookie = new Map();
    {
        let string = request.headers.cookie;
        let tmp = string.split("; ");
        for (let t of tmp) {
            let first = t.split('=')[0], second = t.split('=')[1];
            cookie.set(first, second);
        }
    }//Parse the cookie.
    {
        let data = fs.readFileSync(ToAbsolute("users/" + received["writer"] + "/config/token.txt"), { encoding: "utf-8" });
        if (data != cookie.get("token")) {
            fs.appendFileSync("log.txt", "[ILLEGAL_LOGIN]: Detect illegal login(@" + received["writer"] + ")\n", (err, data) => { console.error(err); });
            return 1;//Illegal login.
        }
    }//Check if the token is correct or not.

    let codename = 0;
    {
        const folders = fs.readdirSync(ToAbsolute("problem"));
        let max = -1;
        folders.forEach((folder) => {
            try {
                max = Math.max(max, Number(folder));
            } catch (err) {
                console.error(err);
            }
        });
        if (max <= 8) codename = '0' + (max + 1);
        else codename = max + 1;
    }//Get next problem id.
    process.chdir(ToAbsolute("problem"));
    fs.mkdirSync(codename, (err, folder) => { console.error(err); });
    process.chdir(codename);
    fs.mkdirSync("in", (err, folder) => { console.error(err); });
    fs.mkdirSync("out", (err, folder) => { console.error(err); });
    process.chdir("in");
    for (let i = 0; i < Number(received["sampleTestCaseNum"]); i++) {
        fs.writeFileSync("sampletestcase" + i + ".txt", received["inputtestcase"][i], (err, data) => { if (err) console.log(err); });
    }

    for (let i = Number(received["sampleTestCaseNum"]); i < Number(received["testCaseNum"]); i++) {
        fs.writeFileSync("testcase" + (i - Number(received["sampleTestCaseNum"])) + ".txt", received["inputtestcase"][i], (err, data) => { if (err) console.log(err); });
    }
    //Create test cases for input.

    process.chdir("../out");

    for (let i = 0; i < Number(received["sampleTestCaseNum"]); i++) {
        fs.writeFileSync("sampletestcase" + i + ".txt", received["outputtestcase"][i], (err, data) => { if (err) console.log(err); });
    }

    for (let i = Number(received["sampleTestCaseNum"]); i < Number(received["testCaseNum"]); i++) {
        fs.writeFileSync("testcase" + (i - Number(received["sampleTestCaseNum"])) + ".txt", received["outputtestcase"][i], (err, data) => { if (err) console.log(err); });  
    }
    //Create test cases for output.
    process.chdir("../");

    jsonSettings = {
        writer: received["writer"],
        sentence: received["sentence"],
        input: received["input"],
        output: received["output"],
        name: received["name"],
        constraint: received["constraint"],
        limitedTime: 2000,
        sampleTestCaseNum: received["sampleTestCaseNum"],
        testCaseNum: received["testCaseNum"]
    };
    fs.writeFileSync("settings.json", JSON.stringify(jsonSettings), (err, data) => { if (err) console.log(err); });
    process.chdir(server_root);

    return codename;
};

const ReturnFile = (request, response) => {
    let url = request.url;
    {
        let tmp = url.split('?');
        url = tmp[0];
    }//Remove the query parameter.
    if (url === '/') url = "html/redirect.html";
    fs.readFile(document_root + url, "utf-8", (err, data) => {
        if (err) {
            response.writeHead(404, { "Content-Type": "text/plain" });
            response.write("404 Not Found: " + url);
            return response.end();
        }
        let ext = "";
        {
            let tmp = url.split('.');
            ext = tmp[tmp.length - 1];
        }
        response.writeHead(200, { "Content-Type": mime_type.get(ext) });
        response.write(data);
        response.end();
    });
};

const func_arr = [Judge, MakeAccount, Login, MakeProblem];

const RequestHandler = (request, response) => {
    if (request.method === "GET") {
        ReturnFile(request, response);
    }
    if (request.method === "POST") {
        request.on("data", (chunk) => {
            let received = JSON.parse(decoder.write(chunk));
            console.log(received);
            const tmp_func = func_arr[Number(received.type)];
            response.write(String(tmp_func(received, request, response)));
            response.end();
        });
    }
};
server.on("request", RequestHandler);
server.listen(process.env.PORT || 8080);
