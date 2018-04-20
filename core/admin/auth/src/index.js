
const XHR = require("./xhr_async");

var next_url = getParam("next_url");
if (next_url) {
  var next_url_input = document.createElement("input");
  next_url_input.type = "hidden";
  next_url_input.name = "next_url";
  next_url_input.value = next_url;

  var auth_form = document.getElementById("auth_form");
  auth_form.appendChild(next_url_input);
}

function getParam(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

let signin_form = document.getElementById("auth_form");
let err_msg_field = document.getElementById("err_msg_field");

signin_form.addEventListener('submit', async function(e) {
  e.preventDefault();
  try {
    let formData = new FormData(signin_form)
    let send_data = {};
    for (let [key, value] of formData.entries()) {
      send_data[key] = value;
    }
    const response = await XHR.post("/admin-auth", send_data);

    if (response.err) {
      err_msg_field.innerHTML = "Neteisingai įvestas e-pašto adresas arba slaptažodis!";
    } else if (response.next_url) {
      window.localStorage.setItem('access_token', response.access_token);
      window.location.replace(response.next_url);
    }
    console.log(response);
  } catch (e) {
    console.error(e);
  }
});
