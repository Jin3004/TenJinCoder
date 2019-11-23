function redirect() {
    location.href = "index.html";
}


function login() {

    let jsonSendData = {
        type: 2,
        username: document.getElementById("id-username").value,
        password: document.getElementById("id-password").value
    };

    $.ajax({

        url: "../html/login.html",
        type: "POST",
        data: JSON.stringify(jsonSendData),
        success: (data) => {
            if (Number(data) === 1) {
                document.getElementById("id-alert").innerHTML = "そのようなユーザー名は存在しません。";
            }
            else if (Number(data) === 2) {
                document.getElementById("id-alert").innerHTML = "パスワードが間違っています。";
            } else {
                document.getElementById("id-alert").innerHTML = "ログインに成功しました。3秒後にホームに戻ります。";
                document.cookie = "user=;max-age=0";
                document.cookie = "token=;max-age=0";
                alert(data);
                document.cookie = "user=" + jsonSendData["username"] + ";token=" + data + ";path=/";
                let timeoutID = setTimeout("redirect()", 3000);
            }
        }

    });

}