var cors_api_url = 'https://ai-art.glstrachan.repl.co/api/';
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
if (!localStorage.getItem('token')) {
  localStorage.setItem('token', 'AFxQ4_qw6oAp2x-0chmXV876uKaK0MOpp7jHHGEMM9rHF4kTLw7EBwkgPcKkHm1I3XvDhkrSjwNaL3OEZNScuB0HRI_7KU40atHceJ6GldadguG8GzDbZb87bRqLu5hnEF9zirEuqhBv2WM3q3tlNu_qg1zUNMvafj6Dg65wNqKJTDM3Vf1YwJI')
}

let token = ""
let refresh = localStorage.getItem('token')

const getToken = async () => {
  doCORSRequest({ method: 'POST', url: 'securetoken.googleapis.com/v1/token?key=AIzaSyDCvp5MTJLUdtBYEKYWXJrlLzu1zuKM6Xw', data: `grant_type=refresh_token&refresh_token=${refresh}` }, (res) => {
    console.log(res)
    const body = JSON.parse(res.responseText);
    refresh = body.refresh_token
    token = body.id_token;
  })
}

getToken();

const onSubmit = async () => {
  prompt = document.getElementById("text").value;
  choices = document.getElementById('choices');
  choice = choices.options[choices.selectedIndex].value;

  let result = await fetch(formUrl("app.wombo.art/api/tasks"), {
    "headers": {
      "Accept": "*/*",
      "Accept-Language": "en-US,en;q=0.5",
      "Authorization": "bearer " + token,
      "Content-Type": "text/plain;charset=UTF-8",
    },
    "body": "{\"premium\":false}",
    "method": "POST",
  });

  let body = await result.json();
  console.log(body);
  console.log(prompt);
  const keywords = prompt;

  result = await fetch(formUrl(`app.wombo.art/api/tasks/${body.id}`), {
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
  image.id = "generating";
  image.className = "image-result"
  image.addEventListener("click", copyLink);
  const results = document.getElementById("results");

  const card = document.createElement("div");
  card.className = "card";
  card.classList.add("result");
  const title = document.createElement("div");
  title.className = "title";
  title.innerText = prompt.substring(0, 20);

  card.appendChild(title);
  card.appendChild(image);


  results.appendChild(card);

  let interval = setInterval(async () => {
    result = await fetch(formUrl(`app.wombo.art/api/tasks/${body.id}`), {
      "headers": {
        "Accept": "/",
        "Accept-Language": "en-US,en;q=0.5",
        "Authorization": "bearer " + token,
      },
      "method": "GET",
    });

    body = await result.json();

    const source = (body.photo_url_list[body.photo_url_list.length - 1])
    console.log(source)
    if(source)
      image.src = source;

    if (body.photo_url_list.find(e => e.includes("final.jpg"))) {
      clearInterval(interval);
      image.id = "complete"
    }
    //console.log(body.photo_url_list);
  }, 1000)
}

const onReset = async () => {
  const images = document.getElementsByClassName("result");
  for (let image of images) {
    image.remove()
  }
}

const copyLink = async (event) => {
  image = event.target;
  navigator.clipboard.writeText(image.src);
}

