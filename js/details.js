function htmlEntities( text, proc ) {//HTMLの特殊文字をエンコードする関数
    let entities = [
      ['&amp;', '&'],
      ['&apos;', '\''],
      ['&lt;', '<'],
      ['&gt;', '>'],
      ['<br>', '\n']
    ];
  
    for ( var i=0, max=entities.length; i<max; i++ ) {
      if ( 'encode' === proc ) {
        text = text.replace(new RegExp( entities[i][1], 'g' ), entities[i][0]).replace( '"', '&quot;' );
      } else {
        text = text.replace( '&quot;', '"' ).replace(new RegExp(entities[i][0], 'g' ), entities[i][1] );
      }
    }
    return text;
}
  

window.onload = () => {

	var user = location.search.split("&")[0].split("=")[1];
	var codeName = location.search.split("&")[1].split("=")[1];


	$.ajax({
		
		type : "GET",
		url : "../users/" + user + "/submission/" + codeName + ".cpp",
        success : (data) => {
            document.getElementById("id-code").innerHTML = htmlEntities(data, "encode");
        },
        error : () => {
            document.getElementById("id-alert").innerHTML = "無効なURLです。";
        }

	})

    $.ajax({

        type : "GET",
        url : "../users/" + user + "/submission/" + codeName + ".txt",
        success : (data) => {

            if(data == "4")document.getElementById("id-result").innerHTML = "CE(コンパイルエラーが発生しました)";
            else if(data == "5")document.getElementById("id-result").innerHTML = "サーバー内部でエラーが発生しました。よろしければ問題報告フォームにてお知らせください。";
            else{
                let str = "";
                for(let i = 0; i < data.length; i++){
                    str += (i + 1) + "つ目のテストケース：";
                    switch(data[i]){
                    case '0':
                        str += "AC(正解しました)";
                        break;

                    case '1':
                        str += "WA(不正解です)";
                        break;

                    case '2':
                        str += "TLE(時間制限を超えました)";
                        break;

                    case '3':
                        str += "RE(ランタイムエラーが発生しました)";
                        break;
                    }
                    str += "<br>";
                }

                document.getElementById("id-result").innerHTML = str;

            }

        },
        error : () => {
            document.getElementById("id-alert").innerHTML = "無効なURLです。";
        }

    });

}