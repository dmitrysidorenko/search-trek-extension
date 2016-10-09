var config = {
  apiKey: "AIzaSyC5N0FavZVS3L-FWaBXnLtuKgC0qJ9CDUE",
  authDomain: "searchtrek.firebaseapp.com",
  databaseURL: "https://searchtrek.firebaseio.com",
  storageBucket: "searchtrek.appspot.com",
  messagingSenderId: "612488784459"
};
firebase.initializeApp(config);
var historyRawRef = firebase.database().ref('history-raw');

var activeTabIds = [undefined, undefined];
const initActive = localStorage.getItem('active') === 'false';
var active = false;

function init() {
  setActive(initActive);

  chrome.tabs.onUpdated.addListener(function (tabId, info, tab) {
    if (active && tab.status == "complete" && info.status !== undefined && tab.url !== "chrome://newtab/") {
      console.log(tabId, tab.url, info, Date.now(), tab.openerTabId, activeTabIds.join(","));
      console.log('Tab:', tab);

      fetch('http://localhost:8080/api/log',
        {
          //mode: 'no-cors',
          method: 'POST',
          headers: new Headers({
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify({
            tabId: tabId,
            favIconUrl: tab.favIconUrl || "",
            title: tab.title,
            tabUrl: tab.url,
            updated: Date.now(),
            openerTabId: tab.openerTabId || activeTabIds[0] || null,
            activeTabIds: activeTabIds.join(",")
          })
        })
        .then(function (json) {
          console.log('history posted', json)
        })
        .catch(function (ex) {
          console.log('post history failed', ex)
        });

      /*historyRawRef.push({
       tabId: tabId,
       favIconUrl: tab.favIconUrl || "",
       title: tab.title,
       tabUrl: tab.url,
       updated: Date.now(),
       openerTabId: tab.openerTabId || activeTabIds[0] || null,
       activeTabIds: activeTabIds.join(",")
       });*/
    }
  });

  chrome.tabs.onActivated.addListener(function (info) {
    activeTabIds.pop();
    activeTabIds.unshift(info.tabId);
    if (active) {
      console.log('active tab changed to ', activeTabIds.join(","));
    }
  });

  /*
   chrome.tabs.onReplaced.addListener(function (addedTabId, removedTabId) {
   var index = activeTabIds.indexOf(removedTabId);
   activeTabIds.splice(index, 1, addedTabId);
   console.log('replaced tabs: ', activeTabIds.join(","));
   });
   */

  chrome.browserAction.onClicked.addListener(function (tab) {
    setActive(!active);
  });

  function setActive(bool) {
    active = bool;
    localStorage.setItem('active', active);
    const icon = !active ? 'inactive.png' : 'active.png';
    chrome.browserAction.setIcon({ path: icon });
  }
}

init();
