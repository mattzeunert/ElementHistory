chrome.devtools.panels.elements.createSidebarPane("My Sidebar",
function(sidebar) {
    // sidebar initialization code here
    console.log(arguments)
    sidebar.setObject({ some_data: "Some data to show" });
    chrome.devtools.panels.elements.onSelectionChanged.addListener(function() {
        chrome.devtools.inspectedWindow.eval("({history: $0.__elementHistory})", function (res) {
            console.log(res)
           sidebar.setObject(res.history)
        });
    });
});