let index = 2;
function increaseTestcase(){
    let table = document.getElementById("table");
    let table2 = document.getElementById("table2");
    let t = document.createElement("textarea");
    let t2 = document.createElement("textarea");
    t.id = index;
    index++;
    t2.id = index;
    table.appendChild(t);
    table2.appendChild(t2);
    index++;
}


function judge() {
    if (document.getElementById("id-name").value.length == 0) {
        return false;
    } else if (document.getElementById("id-sentence").value.length == 0) {
        return false;
    } else if (document.getElementById("id-input").value.length == 0) {
        return false;
    } else if (document.getElementById("id-output").value.length == 0) {
        return false;
    } else if (document.getElementById("id-constraint").value.length == 0) {
        return false;
    } else {
        return true;
    }
}

function makeProblem() {

    if(index > 20)document.getElementById("id-alert").innerHTML = "テストケースが多すぎます。";

    else if (!judge()) {
        document.getElementById("id-alert").innerHTML = "欄を完全に埋めてから提出してください。";
        return;
    }

    else if (document.cookie.length == 0) {
        document.getElementById("id-alert").innerHTML = "ログインしてください。";
        return;
    }


    jsonSendData = {

        type: 3,
        name: document.getElementById("id-name").value,
        sentence: document.getElementById("id-sentence").value,
        input: document.getElementById("id-input").value,
        output: document.getElementById("id-output").value,
        constraint: document.getElementById("id-constraint").value,
        writer: document.cookie.split(';')[0].split('=')[1],
        inputtestcase: [],
        outputtestcase: [],
        sampleTestCaseNum: Number(document.getElementById("sampleTestCase").value),
        testCaseNum: index / 2
    };

    for(let i = 0; i < index; i++){
        if(i % 2 == 0)jsonSendData["inputtestcase"].push(document.getElementById(i).value);
        else jsonSendData["outputtestcase"].push(document.getElementById(i).value);
    }

    $.ajax({

        url: "../html/makeproblem.html",
        type: "POST",
        data: JSON.stringify(jsonSendData),
        async: false,
        success: (data) => {
            document.getElementById("id-alert").innerHTML = "問題を作成しました。問題フォームは";
            document.getElementById("id-alert").innerHTML += '<a href="submitform.html?problem=' + data + '">こちら</a>';
        }

    })

}