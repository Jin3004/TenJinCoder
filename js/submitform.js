var time = 0;//limited time.

window.onload = function(){



    {
        let q = location.search;
        var problem = q.split('=')[1];
    }

    //Get problem id.

    $.ajax({
        type : 'GET',
        url : '../problem/' + problem + '/settings.json',
        success : function(data){


            time = data.limitedTime;

            document.getElementById('id-title').innerHTML = data.name;
            document.getElementById('id-writer').innerHTML += data.writer;
            document.getElementById('id-sentence').innerHTML = data.sentence;
            document.getElementById('id-input').innerHTML = data.input;
            document.getElementById('id-output').innerHTML = data.output;
            document.getElementById('id-constraint').innerHTML = data.constraint;
            //Write each option dynamicly.



            for(let i = 0; i < data.sampleTestCaseNum; i++){
                
                var str = '';

                $.ajax({
                    type : 'get',
                    url : '../problem/' + problem + '/in/sampletestcase' + i + '.txt',
                    async : false,
                    success : function(data){
                        str += '入力 : ';
                        str += data;
                        str += ' ';
                    }
                });

                $.ajax({
                    type : 'get',
                    url : '../problem/' + problem + '/out/sampletestcase' + i + '.txt',
                    async : false,
                    success : function(data){
                        str += '出力 : ';
                        str += data;
                        str += ' ,<br>';
                    }

                });

                document.getElementById('id-sample').innerHTML += str;


            }

            

        }



    })


}



function sendCode(){


    if(document.cookie.length === 0){
        document.getElementById('id-alert').innerHTML = 'ログインしてください。';
    }else{

        document.getElementById('id-alert').innerHTML = "提出しました。自動でリロードされるのでしばしお待ちください。";

        let username = document.cookie.split(';')[0].split('=')[1];

        let jsonSendData = {

            type : 0,
            user : username,
            prob : location.search.split('=')[1],
            limitedTime : time,
            code : document.getElementById('id-code').value

        };
        //Make a request json object.



        $.ajax({


            url : "../html/submitform.html",
            type : "POST",
            data : JSON.stringify(jsonSendData),
            async: false,
            success : (data) => {
                if(Number(data) === 1){
                    document.getElementById("id-alert").innerHTML = "不正ログインを発見しました。直ちに本部へ報告します。";
                }
                else location.href = "results.html";
            },
            error : () => {
                alert("Something went wrong.");
            }
        });
        //Send the request.



    }



}