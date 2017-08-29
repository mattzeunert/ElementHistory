let trackHistoryCode = "console.log('track history code not loaded yet')"
fetch(chrome.extension.getURL("trackHistory.js"))
.then(function(r){
    return r.text()
})
.then(function(text){
    trackHistoryCode = text
})


function onBrowserActionClicked(tab) {
    chrome.tabs.executeScript(tab.tabId, {
        code: `
            var scr = document.createElement("script")
            var code = decodeURI("${encodeURI(trackHistoryCode)}")
            scr.innerHTML = code
            document.body.appendChild(scr)
        `
    }, function(){
        console.log("injected", arguments)
    })
    console.log("clicked", tab)
}
chrome.browserAction.onClicked.addListener(onBrowserActionClicked);