let enabledTabs = []

let trackHistoryCode = "console.log('track history code not loaded yet')"
fetch(chrome.extension.getURL("trackHistory.js"))
.then(function(r){
    return r.text()
})
.then(function(text){
    trackHistoryCode = text
})

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
    console.log("changeinfo", changeInfo, tabId)

    if (changeInfo.status === "loading") {
        if (enabledTabs.includes(tabId)) {
            
            enableInTab(tabId)
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
})

// chrome.tabs.onRemoved.addListener(function(tabId){
//     var session = self.getTabSession(tabId);
//     console.log("onremoved")
//     if (session){
//         console.log("closing")
//         session.close();
//     }
// })

function onBrowserActionClicked(tab) {
    enabledTabs.push(tab.id)
    enableInTab(tab.id)
    
    console.log("clicked", tab)
}
chrome.browserAction.onClicked.addListener(onBrowserActionClicked);

function enableInTab(tabId) {
    if (!tabId) {debugger}
    console.log("enableindtab", enabledTabs, tabId)
    enabledTabs.push(tabId)
    console.log("enabledtabs", enabledTabs)
    chrome.tabs.executeScript(tabId, {
        code: `
            var scr = document.createElement("script")
            var code = decodeURI("${encodeURI(trackHistoryCode)}")
            scr.innerHTML = code
            document.body.appendChild(scr)
        `
    }, function(){
        console.log("injected", arguments)
    })
}