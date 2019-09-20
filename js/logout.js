function logout(){
  document.cookie = "user=;max-age=0";
  document.getElementById("id-alert").innerHTML = "ログアウトしました。ホームは";
  document.getElementById("id-alert").innerHTML += '<a href="index.html">こちら</a>';
}