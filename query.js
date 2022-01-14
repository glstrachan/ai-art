var cors_api_url = 'http://localhost:8080/';
const formUrl = (url) => cors_api_url + url;
function doCORSRequest(options, printResult) {
  var x = new XMLHttpRequest();
  x.open(options.method, cors_api_url + options.url);
  x.onload = x.onerror = function () {
    printResult(x);
  };
  if (/^POST/i.test(options.method)) {
    x.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  }
  x.send(options.data);
}

let token = ""
const getToken = async () => {
  doCORSRequest({ method: 'POST', url: 'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyDCvp5MTJLUdtBYEKYWXJrlLzu1zuKM6Xw', data: '{\"returnSecureToken\":true}' }, (res) => {
    const body = JSON.parse(res.responseText);
    //console.log(body);
    token = body.idToken;
  })
}

getToken();

const onSubmit = async () => {
  prompt = document.getElementById("text").value;
  choices = document.getElementById('choices');
  choice = choices.options[choices.selectedIndex].value;

  let result = await fetch("http://localhost:8080/https://app.wombo.art/api/tasks", {
    "headers": {
      "Accept": "*/*",
      "Accept-Language": "en-US,en;q=0.5",
      "Authorization": "bearer " + token,
      "Content-Type": "text/plain;charset=UTF-8",
    },
    "body": "{\"premium\":false}",
    "method": "POST",
  });

  //console.log(result);
  let body = await result.json();
  console.log(body);
  console.log(prompt);
  const keywords = prompt;

  result = await fetch(formUrl(`https://app.wombo.art/api/tasks/${body.id}`), {
    "headers": {
      "Accept": "/",
      "Accept-Language": "en-US,en;q=0.5",
      "Authorization": "bearer " + token,
      "Content-Type": "text/plain;charset=UTF-8",
    },
    "body": `{\"input_spec\":{\"prompt\":\"${keywords}\",\"style\":${choice},\"display_freq\":10},\"premium\": true}`,
    "method": "PUT",
  });

  const image = document.createElement("img");
  image.src = "none.jpg";
  image.className = "image-result"
  image.classList.add("result");
  image.addEventListener("click", copyLink);
  const results = document.getElementById("results");
  results.appendChild(image);

  let interval = setInterval(async () => {
    result = await fetch(formUrl(`https://app.wombo.art/api/tasks/${body.id}`), {
      "headers": {
        "Accept": "/",
        "Accept-Language": "en-US,en;q=0.5",
        "Authorization": "bearer " + token,
      },
      "method": "GET",
    });

    body = await result.json();
    if (body.photo_url_list.find(e => e.includes("final.jpg"))) {
      clearInterval(interval);
      const source = (body.photo_url_list[body.photo_url_list.length - 1])

      image.src = source;
    }
    //console.log(body.photo_url_list);
  }, 1000)
}

const onReset = async () => {
  const images = document.getElementsByClassName("image-result");
  for (let image of images) {
    image.remove()
  }
}

const copyLink = async (event) => {
  image = event.target;
  navigator.clipboard.writeText(image.src);
}

