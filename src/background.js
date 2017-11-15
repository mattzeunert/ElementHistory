let sessions = {};


let trackHistoryCode = "console.log('track history code not loaded yet')";
fetch(chrome.extension.getURL("trackHistory.js"))
    .then(function(r){
        return r.text();
    })
    .then(function(text){
        trackHistoryCode = text;
    });

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
    console.log("changeinfo", changeInfo, tabId);

    if (changeInfo.status === "loading") {
        if (isEnabledInTab(tabId)) {
            enableInTab(tabId);
        }

        // prevent double activation

        // Need to check if stage is RELOADING, because the
        // tab state provided by changeInfo can revert
        // back to loading after the session has already been
        // initialized
        // if (session.isReloading()) {
        //     session.initialize();
        // } else {
        //     console.log("changeinfo status is back to loading, but session is already initialized (stage:", session._stage, ")")
        // }
    }
});

// chrome.tabs.onRemoved.addListener(function(tabId){
//     var session = self.getTabSession(tabId);
//     console.log("onremoved")
//     if (session){
//         console.log("closing")
//         session.close();
//     }
// })

function isEnabledInTab(tabId) {
    return sessions[tabId] && sessions[tabId].enabled;
}

function onBrowserActionClicked(tab) {
    if (isEnabledInTab(tab.id)){ 
        disableInTab(tab.id);
        chrome.tabs.executeScript(tab.id, {
            code: `
                var scr = document.createElement("script")
                var code = decodeURI("${encodeURI("window.__elementHistory.disableTracking()")}")
                scr.innerHTML = code;
                (document.documentElement || document.body).appendChild(scr)
            `,
            runAt: "document_start"
        }, function(){
            console.log("disabled", arguments);
        });
    }
    else {
        enableInTab(tab.id);
    }
    
    console.log("clicked", tab);
}
chrome.browserAction.onClicked.addListener(onBrowserActionClicked);

function disableInTab(tabId) {
    sessions[tabId] = null;
    chrome.browserAction.setBadgeText({
        text: "",
        tabId: tabId,
    });
}

function enableInTab(tabId) {
    if (!tabId) {;}
    // console.log("enableindtab", enabledTabs, tabId)
    sessions[tabId] = {
        enabled: true
    };
    chrome.browserAction.setBadgeText({
        text: "ON",
        tabId: tabId,
    });
    // console.log("enabledtabs", enabledTabs)
    console.log("calling executescript");
    chrome.tabs.executeScript(tabId, {
        code: `
            var scr = document.createElement("script")
            var code = decodeURI("${encodeURI(trackHistoryCode  + ";window.__elementHistory.enableTracking()")}")
            scr.innerHTML = code;
            (document.documentElement || document.body).appendChild(scr)
        `,
        runAt: "document_start"
    }, function(){
        console.log("injected", arguments);
    });

    /*
    could this work too? 
    chrome.tabs.executeScript({
        file: '/scripts/runsOnPageLoad.js'
    }); 
    */
}