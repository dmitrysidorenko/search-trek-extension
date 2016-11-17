var replaced = {};
var activeTabIds = [undefined, undefined];
var initActive = localStorage.getItem('active') === 'true';
var active = false;

function init() {
  setActive(initActive);

  chrome.tabs.onUpdated.addListener(function (tabId, info, tab) {
    if (active && tab.status == "complete" && info.status !== undefined && tab.url !== "chrome://newtab/") {

        var opener = tab.openerTabId;
        if (!tab.openerTabId && replaced.hasOwnProperty(tab.id)) {
            opener = replaced[tab.id];
        }

        console.log(tabId, tab.url, Date.now(), opener, activeTabIds.join(","));

      fetch('http://localhost:8888/api/log',
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
            openerTabId: opener || activeTabIds[0] || null,
            activeTabIds: activeTabIds.join(",")
          })
        })
        .then(function (json) {
          console.log('history posted', json)
        })
        .catch(function (ex) {
          console.log('post history failed', ex)
        });
    }
  });


    chrome.tabs.onActivated.addListener(function (info) {
        chrome.tabs.get(info.tabId, function (tab) {
            if (tab.status === 'complete') {
                activeTabIds.pop();
                activeTabIds.unshift(info.tabId);
                console.log('active tab changed to ', activeTabIds.join(","));
            } else if (tab.url === "chrome://newtab/") {
                replaced[tab.id] = activeTabIds[0];
            }
        });
    });

    chrome.tabs.onReplaced.addListener(function (addedTabId, removedTabId) {
        if (replaced.hasOwnProperty(removedTabId)) {
            replaced[addedTabId] = replaced[removedTabId];
            delete replaced[removedTabId];
            console.log('replaced tab ', removedTabId, ' to ', addedTabId);
        }
    });

  chrome.browserAction.onClicked.addListener(function (tab) {
    setActive(!active);
  });

  function setActive(bool) {
    console.log('setting active flag to ' + bool)
    active = bool;
    localStorage.setItem('active', active);
    const icon = !active ? 'inactive.png' : 'active.png';
    chrome.browserAction.setIcon({ path: icon });
  }
}

init();
