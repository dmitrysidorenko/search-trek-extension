var searches = {};

chrome.runtime.onConnect.addListener(function (port) {
    if (port.name === "search-trek-channel") {
        port.onMessage.addListener(function (msg) {
            if (!searches.hasOwnProperty(msg.search)) {
                searches[msg.search] = [];
            }
            searches[msg.search].push(msg.link);
            console.log(searches);
        });
    }
});

/*
 var regex = /google\.com/;
 chrome.tabs.onUpdated.addListener(function (tabId, info, tab) {
 if (tab.status == "complete" && regex.test(tab.url)) {
 // debugger
 }
 });*/
