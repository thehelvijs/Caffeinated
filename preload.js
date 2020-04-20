// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

const { remote } = require('electron');

let currWindow = remote.BrowserWindow.getFocusedWindow();

window.closeCurrentWindow = function(){
  currWindow.close();
}

window.addEventListener('DOMContentLoaded', () => {
  init();
});

function init() {
  const Store = require('electron-store');
  const store = new Store();

  // store.clear();

  function httpGet(url) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", url, false);
    xmlHttp.send(null);
    return xmlHttp.responseText;
  }

  var userSaved = store.get('user');
  if(userSaved !== undefined)
  {
    var followerList = JSON.parse(httpGet("https://caffeinated-api.herokuapp.com/followers/" + store.get("user")));
    store.set("lastFollower", followerList.followers[0].followed_at);

    var link = "https://caffeinated-api.herokuapp.com/users/" + userSaved;
    
    var json = new XMLHttpRequest();
    json.open("GET", link, false); 
    json.send(null);
  
    var userInfo = JSON.parse(json.response);
    userInfo = userInfo.user;
  
    document.getElementById('menuAvatar').src = "https://images.caffeine.tv" + userInfo.avatar_image_path;
    document.getElementById("greetings").innerHTML = "Hey, " + userInfo.username + "!";
    document.getElementById("followersTitle").innerHTML = "Followers";
    document.getElementById("followerCount").innerHTML = userInfo.followers_count;
  }
 
  // Check saved checkboxes
  var checkBoxes = ["playAudioFollower", "showGIFFollower", "playAudioDonation", "showGIFDonation"];
  var checkBoxesDefault = [1, 1, 1, 1];
  for(var i = 0; i < checkBoxes.length; i++)
  {
    var state = store.get(checkBoxes[i]);
    if(state === undefined)
    {
      store.set(checkBoxes[i], checkBoxesDefault[i]);
    }
    document.getElementById(checkBoxes[i]).checked = state;
  }

  var hostPort = store.get('hostPort');
  if(hostPort === undefined) {
    hostPort = 8080;
    store.set('hostPort', hostPort);
  }
  document.getElementById("setPort").value = hostPort;


  var maxChatVal = store.get('maxChat');
  if(maxChatVal === undefined) {
    maxChatVal = 5;
    store.set('maxChat', maxChatVal);
  }
  document.getElementById("setChatMax").value = maxChatVal;

  var textColor = store.get('chatTextColor');
  if(textColor === undefined) {
    textColor = '#ffffff';
    store.set('chatTextColor', textColor);
  }
  document.getElementById('setChatTextColor').value = textColor;

  var followerColor = store.get('followerColor');
  if(followerColor === undefined) {
    followerColor = '#31f8ff';
    store.set('followerColor', followerColor);
  }
  document.getElementById('setFollowerColor').value = followerColor;

  var donationColor = store.get('donationColor');
  if(donationColor === undefined) {
    donationColor = '#31f8ff';
    store.set('donationColor', donationColor);
  }
  document.getElementById('setDonationColor').value = donationColor;

  var followerAudio = store.get('followerAudio');
  if(followerAudio === undefined) {
    followerAudio = __dirname+'/media/follower.mp3';
    store.set('followerAudio', followerAudio);
  }

  var followerGIF = store.get('followerGIF');
  if(followerGIF === undefined) {
    followerGIF = __dirname+'/media/follower.gif';;
    store.set('followerGIF', followerGIF);
  }

  var donationAudio = store.get('donationAudio');
  if(donationAudio === undefined) {
    donationAudio = __dirname+'/media/donation.mp3';
    store.set('donationAudio', donationAudio);
  }

  var donationGIF = store.get('donationGIF');
  if(donationGIF === undefined) {
    donationGIF = __dirname+'/media/donation.gif';
    store.set('donationGIF', donationGIF);
  }

  var donationText = store.get('donationText');
  if(donationText === undefined) {
    donationText = 'just donated';
    store.set('donationText', donationText);
  }

  // Remove splash screen and show content
  var element = document.getElementById("splash");
  element.classList.add("hide");
  element = document.getElementById("content");
  element.classList.remove("hide");
}
