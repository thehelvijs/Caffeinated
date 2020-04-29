// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

const { remote } = require('electron');
const Store = require('electron-store');
const store = new Store();

let currWindow = remote.BrowserWindow.getFocusedWindow();

window.closeCurrentWindow = function(){
  currWindow.close();
}

window.addEventListener('DOMContentLoaded', () => {
  init();
});

initial_values();

function initial_values() {
  console.log('values');
  var hostPort = store.get('hostPort');
  if(hostPort === undefined) {
    hostPort = 8080;
    store.set('hostPort', hostPort);
  }

  var timeoutFollowers = store.get('timeoutFollowers');
  if(timeoutFollowers === undefined) {
    timeoutFollowers = 5;
    store.set('timeoutFollowers', timeoutFollowers);
  }

  var timeoutDonations = store.get('timeoutDonations');
  if(timeoutDonations === undefined) {
    timeoutDonations = 10;
    store.set('timeoutDonations', timeoutDonations);
  }

  var maxChatVal = store.get('maxChat');
  if(maxChatVal === undefined) {
    maxChatVal = 5;
    store.set('maxChat', maxChatVal);
  }
  
  var textColor = store.get('chatTextColor');
  if(textColor === undefined) {
    textColor = '#ffffff';
    store.set('chatTextColor', textColor);
  }
  
  var followerColor = store.get('followerColor');
  if(followerColor === undefined) {
    followerColor = '#31f8ff';
    store.set('followerColor', followerColor);
  }
  
  var donationColor = store.get('donationColor');
  if(donationColor === undefined) {
    donationColor = '#31f8ff';
    store.set('donationColor', donationColor);
  }

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

  var donatorList = store.get('donatorList');
  if(donatorList === undefined) {
    donatorList = {};
    store.set('donatorList', donatorList);
  }

  var goalTitleColor = store.get('goalTitleColor');
  if(goalTitleColor === undefined) {
    goalTitleColor = '#ffffff';
    store.set('goalTitleColor', goalTitleColor);
  }
  
  var goalBarColor = store.get('goalBarColor');
  if(goalBarColor === undefined) {
    goalBarColor = '#31f8ff';
    store.set('goalBarColor', goalBarColor);
  }
  
  var goalReached = store.get('goalReached');
  if(goalReached === undefined) {
    goalReached = 0;
    store.set('goalReached', goalReached);
  }
  
  var goalType = store.get('goalType');
  if(goalType === undefined) {
    goalType = 0;
    store.set('goalType', goalType);
  }
}

function init() {
  // var followerLink = "http://127.0.0.1:5000/followers/";
  // var usersLink = "http://127.0.0.1:5000/users/";
  var followerLink = "https://caffeinated-api.herokuapp.com/followers/";
  var usersLink = "https://caffeinated-api.herokuapp.com/users/";

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
    var followerList = JSON.parse(httpGet(followerLink + store.get("user") + "/100"));
    store.set("followerListFull", followerList);
    store.set("lastFollower", followerList.followers[0].followed_at);

    var link = usersLink + userSaved;
    
    var json = new XMLHttpRequest();
    json.open("GET", link, false); 
    json.send(null);
  
    var userInfo = JSON.parse(json.response);
    userInfo = userInfo.user;
  
    document.getElementById('menuAvatar').src = "https://images.caffeine.tv" + userInfo.avatar_image_path;
    var name = userInfo.username;
    try {
      name = userInfo.name;
      if(name === null || name === undefined) {
        name = userInfo.username;
      }
    } catch (e) {
      // do nothing?
    }
    document.getElementById("greetings").innerHTML = "Hey, " + name + "!";
    document.getElementById("followersTitle").innerHTML = "Followers";
    document.getElementById("followerCount").innerHTML = userInfo.followers_count;

    /* Set goal */
    if(store.get("goal") !== undefined) {
      var usd = store.get("goal");
      var credits = Math.round((usd / 0.00995024875)*100)/100;
      var gold = Math.round((credits / 3)*100)/100;
      document.getElementById("goalUSD").value = usd;
      document.getElementById("goalCredits").value = credits;
      document.getElementById("goalGold").value = gold;
    }
  }
 
  // Check saved checkboxes
  var checkBoxes = ["playAudioFollower", "showGIFFollower", "playAudioDonation", "showGIFDonation", "enableAlertFollowers", "enableAlertDonations", "enableChat", "enableGoal"];
  var checkBoxesDefault = [1, 1, 1, 1, 1, 1, 1, 0, 0];
  for(var i = 0; i < checkBoxes.length; i++)
  {
    var state = store.get(checkBoxes[i]);
    if(state === undefined)
    {
      store.set(checkBoxes[i], checkBoxesDefault[i]);
      state = checkBoxesDefault[i];
    }
    document.getElementById(checkBoxes[i]).checked = state;
  }

  document.getElementById("setPort").value = store.get('hostPort');
  document.getElementById("setTimeoutFollowers").value = store.get('timeoutFollowers');
  document.getElementById("setTimeoutDonations").value = store.get('timeoutDonations');
  document.getElementById("setChatMax").value = store.get('maxChat');
  document.getElementById('setChatTextColor').value = store.get('chatTextColor');
  document.getElementById('setFollowerColor').value = store.get('followerColor');
  document.getElementById('setDonationColor').value = store.get('donationColor');
  var goalTitle = store.get('goalTitle');
  if(goalTitle !== undefined) {
    document.getElementById('setGoalTitle').value = goalTitle;
  }
  document.getElementById('setGoalTextColor').value = store.get('goalTitleColor');
  document.getElementById('setGoalBarColor').value = store.get('goalBarColor');
  document.getElementById('goalReached').value = store.get('goalReached');
  document.getElementById('goalTypes').selectedIndex = store.get('goalType');

  // Remove splash screen and show content
  var element = document.getElementById("splash");
  element.classList.add("hide");
  element = document.getElementById("content");
  element.classList.remove("hide");
}
