window.onload = () => {
	
	$.ajax({

		type : "GET",
		url : "../json/results.json",
		async : false,
		success : (data) => {
		
			let string = "";
      const num = data["results"].length;

			for(let i = 0; i < num; i++){

				string += (i === num - 1) ? "<tr class=\"bottomrect\">" : "<tr>";

				string += "<td>";
				string += data["results"][i]["user"];
				string += "</td>";

				string += "<td>";
				string +="<a href=\"submitform.html?problem=";
				string += (data["results"][i]["problem"] + "\">");
				string += data["results"][i]["problem"];
				string += "</a>";
				string += "</td>";

				string += "<td>";
				//string += "<font color=\"red\">" + data["results"][i]["result"] + "</font>";
				
        switch(data["results"][i]["result"]){
        
          case "AC":
            string += "<span style=\"background-color: #c0c0c0\"><font color=\"#98fb98\">" + data["results"][i]["result"] + "</font></span>";
            break;
          default:
            string += "<span style=\"background-color: #c0c0c0\"><font color=\"yellow\">" + data["results"][i]["result"] + "</font></span>";
            break;

        }

        string += "</td>";

				string += "<td>";
				string +="<a href=\"details.html?user=";
				string += data["results"][i]["user"];
				string += "&code=";
				string += data["results"][i]["codeName"];
				string += "\">詳細";
				string += "</a>";
				string += "</td>";

				string += "</tr>";


			}
			document.getElementById("id-table").innerHTML += string;

		}

	});

}
