const http = require('http');
const fs = require('fs');
const querystring = require('querystring');
const StringDecoder = require('string_decoder').StringDecoder;
const decoder = new StringDecoder('utf8');
const execSync = require('child_process').execSync;

//Import some modules.


const server = http.createServer();
const path = __dirname;
const rootDir = path + "/../";


//Declare constant variables.

const forbitten_files = ["password.txt", "testcase", "serverside.js"];//アクセス禁止のファイル


function isExistFile(file) {
    try {
        fs.statSync(file);
        return true;
    } catch (err) {
        if (err === 'ENOENT') {
            return false;
        }
    }
}


function judge(rcvJson) {

    {
        var codeName = '';
        let max = -1;
        let files = [];
        files = fs.readdirSync('../users/' + rcvJson['user'] + '/submission');
        files.forEach((file) => {
            let tmp = file.split('.');
            let filename = tmp[0];
            max = Math.max(max, Number(filename));
        });


        if (max <= 8) {
            codeName = '0' + (max + 1);
        } else {
            codeName = max + 1;
        }


    }//Get next code name.


    process.chdir('../users/' + rcvJson['user'] + '/submission');
    fs.writeFileSync(codeName + '.cpp', rcvJson['code'], (err, data) => { if (err) console.log(err); });
    //Make source file.


    process.chdir('../../../bin');
    var judgeCmd = 'judge.exe ' + rcvJson['prob'] + ' ' + rcvJson['user'] + ' ' + rcvJson['limitedTime'] + ' ' + codeName;

    var out = execSync(judgeCmd).toString();

    process.chdir('../users/' + rcvJson['user'] + '/submission');
    fs.writeFileSync(codeName + ".txt", out, (err, data) => { console.log("unchi"); });
    process.chdir(path);

    {

        let tmparr = ["AC", "WA", "TLE", "RE", "CE"];
        var res = "";
        let tmpval = -1;

        for (let i = 0; i < out.length; i++) {
            tmpval = Math.max(tmpval, Number(out[i]));
        }
        res = tmparr[tmpval];
    }


    var txt = fs.readFileSync("../json/results.json", "utf-8", (err, data) => { });
    var json = JSON.parse(txt);
    json.results.push({ user: rcvJson["user"], result: res, problem: rcvJson["prob"], codeName: codeName });
    txt = JSON.stringify(json);
    fs.writeFileSync("../json/results.json", txt, (err, data) => { });



    return '0';

}


function makeAccount(rcvJson) {

    let username = rcvJson["username"];
    let password = rcvJson["password"];

    process.chdir("../users");
    if (isExistFile(username)) {
        return '1';
    } else {
        fs.mkdirSync(username, (err, folder) => { console.log(err); });
        process.chdir(username);
        fs.mkdirSync("config", (err, folder) => { console.log(err); });
        fs.mkdirSync("submission", (err, folder) => { console.log(err); });
        process.chdir("config");
        fs.writeFileSync("password.txt", password, (err, data) => { console.log(err); });
        process.chdir(path);
        return '0';
    }

}

function login(rcvJson) {

    let username = rcvJson["username"];
    let password = rcvJson["password"];

    process.chdir("../users");

    if (!isExistFile(username)) {//If this user directory does not exist, return 1;
        process.chdir(path);
        return "1";
    } else {
        process.chdir(username);
        process.chdir("config");
        let validPassword = fs.readFileSync("password.txt", "utf-8", (err, data) => { });
        process.chdir(path);
        if (validPassword == password) return "0";
        else return "2";
    }

}


function makeProblem(rcvJson) {

    let files = fs.readdirSync("../problem");
    let maxval = -1;
    let problem_id = "";
    files.forEach((file) => {
        maxval = Math.max(maxval, Number(file.split('.')[0]));
    });
    if (maxval <= 8) problem_id = '0' + (maxval + 1);
    else problem_id = maxval + 1;
    process.chdir("../problem/");
    fs.mkdirSync(problem_id, (err, folder) => { console.log(err); });
    process.chdir(problem_id);
    fs.mkdirSync("in", (err, folder) => { console.log(err); });
    fs.mkdirSync("out", (err, folder) => { console.log(err); });

    process.chdir("in");
    for (let i = 0; i < Number(rcvJson["sampleTestCaseNum"]); i++) {
        fs.writeFileSync("sampletestcase" + i + ".txt", rcvJson["inputtestcase"][i], (err, data) => { if (err) console.log(err); });
    }

    for (let i = Number(rcvJson["sampleTestCaseNum"]); i < Number(rcvJson["testCaseNum"]); i++) {
        fs.writeFileSync("testcase" + (i - Number(rcvJson["sampleTestCaseNum"])) + ".txt", rcvJson["inputtestcase"][i], (err, data) => { if (err) console.log(err); });
    }

    process.chdir("../out");

    for (let i = 0; i < Number(rcvJson["sampleTestCaseNum"]); i++) {
        fs.writeFileSync("sampletestcase" + i + ".txt", rcvJson["outputtestcase"][i], (err, data) => { if (err) console.log(err); });
    }

    for (let i = Number(rcvJson["sampleTestCaseNum"]); i < Number(rcvJson["testCaseNum"]); i++) {
        fs.writeFileSync("testcase" + (i - Number(rcvJson["sampleTestCaseNum"])) + ".txt", rcvJson["outputtestcase"][i], (err, data) => { if (err) console.log(err); });
    }
    //出力用のテストケースの作成
    process.chdir("../");

    jsonSettings = {
        writer: rcvJson["writer"],
        sentence: rcvJson["sentence"],
        input: rcvJson["input"],
        output: rcvJson["output"],
        name: rcvJson["name"],
        constraint: rcvJson["constraint"],
        limitedTime: 2000,
        sampleTestCaseNum: rcvJson["sampleTestCaseNum"],
        testCaseNum: rcvJson["testCaseNum"]
    };
    fs.writeFileSync("settings.json", JSON.stringify(jsonSettings), (err, data) => { if (err) console.log(err); });
    process.chdir(path);
    return problem_id;
}


//Declare functions.



var extMap = new Map([["html", "text/html"], ["css", "text/css"], ["js", "text/javascript"], ["json", "application/json"], ["ico", "image/ico"], ['txt', 'text/plain'], ['cpp', 'text/plain'], ['py', 'text/plain']]);

server.on('request', (req, res) => {



    if (req.method === 'GET') {



        if (req.url == '/') {//If request URL is null,access to index.html automaticly.
            fs.readFile('html/index.html', 'utf-8', (err, data) => {
                if (err) {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.write('404 Not Found.');
                    return res.end();
                }


                res.writeHead(200, { 'content-Type': 'text/html' });
                res.write(data);
                res.end();
            });
        } else {

            let url = req.url.split('?')[0];
            let file = "";
            {
                let tmp = url.split('/');
                file = tmp[tmp.length - 1];
            }
            fs.readFile(rootDir + url, 'utf-8', (err, data) => {


                if (err) {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.write('404 Not Found.' + err);
                    return res.end();
                }


                let ext = '';
                {
                    let tmp = url.split('.');
                    ext = tmp[tmp.length - 1];
                }
                res.writeHead(200, { 'Content-Type': extMap.get(ext) });
                res.write(data);
                res.end();


            });


        }
    }




    if (req.method === 'POST') {




        req.on('data', (chunk) => {

            {
                let rcvData = decoder.write(chunk);
                var rcvJson = JSON.parse(rcvData);
            }//Get received json object.

            switch (String(rcvJson['type'])) {

                case '0':
                    res.write(judge(rcvJson));
                    res.end();
                    break;

                case '1':
                    res.write(makeAccount(rcvJson));
                    res.end();
                    break;

                case "2":
                    res.write(login(rcvJson));
                    res.end();
                    break;

                case "3":
                    console.log("great");
                    res.write(makeProblem(rcvJson));
                    res.end();
                    break;

                default:
                    res.write('0');
                    res.end();
                    break;

            }

        });

    }



});




server.listen(3000);