window.onload = () => {
	
	$.ajax({

		type : "GET",
		url : "../json/results.json",
		async : false,
		success : (data) => {
		
			let string = "";

			for(let i = 0; i < data["results"].length; i++){


				string += "<tr>";

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
				string += data["results"][i]["result"];
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