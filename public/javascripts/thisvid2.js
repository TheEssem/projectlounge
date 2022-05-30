var statusElement = document.getElementById("status");
function upload(file) {
  if (file.size > 26214400) return statusElement.innerHTML = "That file is over 25MB!";
  var fd = new window.FormData();
  fd.append("video", file);
  statusElement.innerHTML = "Generating...";
  window.fetch("/thisvid2/upload", {
    method: "post",
    body: fd
  }).then(res => res.json()).then(json => {
    if (json.error) return statusElement.innerHTML = `There was an error while generating the video: ${json.error}`;
    statusElement.innerHTML = "Downloading...";
    document.getElementById("frame").src = json.data;
  }).catch(error => {
    console.error(error);
  });
}

function uploadFile(event) {
  if (typeof window.FileReader !== "function")
    throw ("The file API isn't supported on this browser.");
  var input = event.target;
  if (!input)
    throw ("The browser does not properly implement the event object");
  if (!input.files)
    throw ("This browser does not support the `files` property of the file input.");
  if (!input.files[0])
    return undefined;
  statusElement.innerHTML = "Processing...";
  var file = input.files[0];
  upload(file);
}

function uploadExtVideo() {
  var url = document.getElementById("link").value;
  if (!url) return;
  if (!isValidURL(url)) return statusElement.innerHTML = "That isn't a valid URL!";
  statusElement.innerHTML = "Processing...";
  window.fetch(`/thisvid2/uploadytdl?url=${url}`).then(res => {
    return res.json();
  }).then(json => {
    if (json.error) return statusElement.innerHTML = `There was an error while generating the video: ${json.error}`;
    statusElement.innerHTML = "Downloading...";
    document.getElementById("frame").src = json.data;
  }).catch(error => {
    console.error(error);
  });
}

function isValidURL(str) {
  var a = document.createElement("a");
  a.href = str;
  return (a.host && a.host != window.location.host);
}