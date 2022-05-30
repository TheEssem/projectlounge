var statusOutput = document.getElementById("status");
var link = document.getElementById("link");
var infoButton = document.getElementById("infoButton");
var downloadButton = document.getElementById("downloadButton");
infoButton.addEventListener("click", getInfo);
downloadButton.addEventListener("click", download);

function download() {
  statusOutput.innerHTML = "Your download is starting...";
  window.location.replace(`/ytdl/download?url=${link.value}`);
}

function getInfo() {
  var videoInfo = document.getElementById("info");
  var links = document.getElementById("links");
  videoInfo.innerHTML = "";
  links.innerHTML = "";
  statusOutput.innerHTML = "Loading info...";
  window.fetch(`/ytdl/info?url=${link.value}`).then(info => info.json()).then(json => {
    if (json.extractError) throw json.extractError;
    var image = document.createElement("img");
    var title = document.createElement("p");
    var imageLink = document.createElement("a");
    var extractor = document.createElement("p");
    var audioLinks = [];
    var videoLinks = [];
    var miscLinks = [];
    imageLink.href = json.webpage_url;
    image.src = json.thumbnail ? json.thumbnail : "/pictures/thumbnail.png";
    image.classList.add("img-fluid");
    title.innerHTML = json.title;
    title.classList.add("lead");
    extractor.innerHTML = `Extractor: ${json.extractor}`;
    extractor.classList.add("lead");
    videoInfo.appendChild(extractor);
    imageLink.appendChild(image);
    videoInfo.appendChild(imageLink);
    videoInfo.appendChild(title);
    if (!json.formats) {
      var container = document.createElement("div");
      var message = document.createElement("p");
      container.classList.add("justify-content-end");
      message.innerHTML = "No alternate links found.";
      message.classList.add("h3");
      container.appendChild(message);
      links.appendChild(container);
      statusOutput.innerHTML = "";
    } else {
      json.formats.forEach((value) => {
        if (value.vcodec !== "none") {
          videoLinks.push(value);
        } else if (value.acodec !== "none") {
          audioLinks.push(value);
        } else {
          miscLinks.push(value);
        }
      });

      var videoLinkContainer = document.createElement("div");
      var videoLinkTitle = document.createElement("p");
      videoLinkContainer.classList.add("justify-content-end");
      videoLinkTitle.innerHTML = "Video Links";
      videoLinkTitle.classList.add("h3");
      videoLinkContainer.appendChild(videoLinkTitle);
      videoLinks.filter((item, pos, self) => {
        return self.indexOf(item) == pos;
      }).forEach((value) => {
        var videoLink = document.createElement("a");
        videoLink.classList.add("btn");
        videoLink.classList.add("btn-primary");
        videoLink.classList.add("row");
        videoLink.classList.add("btn-block");
        videoLink.href = `/ytdl/download?url=${link.value}&format=${value.format_id}`;
        var linkResValue = `${value.width}x${value.height} (Bitrate: ${value.tbr} kbps) (${value.ext})`;
        var linkAudioValue = value.acodec === "none" && value.asr === null ? `${linkResValue} (no audio)` : linkResValue;
        var linkValue = `${linkAudioValue} (Format: ${value.format_id})`;
        videoLink.innerHTML = linkValue;
        videoLinkContainer.appendChild(videoLink);
      });
      links.appendChild(videoLinkContainer);
      links.appendChild(document.createElement("br"));

      var audioLinkContainer = document.createElement("div");
      var audioLinkTitle = document.createElement("p");
      audioLinkContainer.classList.add("justify-content-end");
      audioLinkTitle.innerHTML = "Audio Links";
      audioLinkTitle.classList.add("h3");
      audioLinkContainer.appendChild(audioLinkTitle);
      audioLinks.forEach((value) => {
        var audioLink = document.createElement("a");
        audioLink.classList.add("btn");
        audioLink.classList.add("btn-primary");
        audioLink.classList.add("row");
        audioLink.classList.add("btn-block");
        audioLink.href = `/ytdl/download?url=${link.value}&format=${value.format_id}`;
        audioLink.innerHTML = `${value.asr} Hz (Bitrate: ${value.abr} kbps) (${value.ext}) (Format: ${value.format_id})`;
        audioLinkContainer.appendChild(audioLink);
      });
      links.appendChild(audioLinkContainer);
      links.appendChild(document.createElement("br"));

      var miscLinkContainer = document.createElement("div");
      var miscLinkTitle = document.createElement("p");
      miscLinkContainer.classList.add("justify-content-end");
      miscLinkTitle.innerHTML = "Miscellaneous Links";
      miscLinkTitle.classList.add("h3");
      miscLinkContainer.appendChild(miscLinkTitle);
      miscLinks.forEach((value) => {
        var miscLink = document.createElement("a");
        miscLink.classList.add("btn");
        miscLink.classList.add("btn-primary");
        miscLink.classList.add("row");
        miscLink.classList.add("btn-block");
        miscLink.href = `/ytdl/download?url=${link.value}&format=${value.format_id}`;
        miscLink.innerHTML = value.format;
        miscLinkContainer.appendChild(miscLink);
      });
      links.appendChild(miscLinkContainer);

      title.innerHTML = json.title;
      statusOutput.innerHTML = "";
    }
  }).catch(error => {
    console.log(error);
    if (error.type === "ytdlerror") {
      statusOutput.innerHTML = "Video not found";
    } else {
      statusOutput.innerHTML = `Error: ${error.message ? error.message : error}`;
    }
  });
}
