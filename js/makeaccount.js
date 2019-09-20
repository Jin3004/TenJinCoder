function redirect(){
    location.href = "index.html";
}


function makeAccount(){

    document.getElementById("id-alert").innerHTML = "ただいまリクエストを送信しました。今しばらくお待ちください。";

    var jsonSendData = {

        type : 1,
        username : document.getElementById("id-username").value,
        password : document.getElementById("id-password").value

    };

    
    $.ajax({

        url : "../html/makeaccount.html",
        type : "POST",
        data : jsonSendData,
        success : (data) => {
            if(data == "0"){
                document.getElementById("id-alert").innerHTML = "アカウントの作成に成功しました。3秒後にホームに戻ります。";
                document.cookie = "user=;max-age=0";
                document.cookie = "user=" + document.getElementById("id-username").value + ";path=/";
                let timeOutID = setTimeout("redirect()", 3000);
            }
            if(data == "1"){
                document.getElementById("id-alert").innerHTML = "そのユーザー名は既に存在しています。";
            }
        }

    });

}