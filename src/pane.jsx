const NotApplicable = "ElementHistory value: not applicable";

var React = require("react");
window.React = React;
var ReactDom = require("react-dom");
var ErrorStackParser = require("error-stack-parser");
import {sortBy} from "lodash";

if (chrome.devtools) {
    update();
    chrome.devtools.panels.elements.onSelectionChanged.addListener(function() {
        update();
    });
    function update(){
        chrome.devtools.inspectedWindow.eval(`
            (window.___getHist = function getHist() {
                var hist = $0.__elementHistory
                if (!hist) {
                    return null
                }
                var ret = {}
                Object.keys(hist).forEach(function(prop) {
                    ret[prop] = hist[prop].map(function(histItem) {
                        var newItem = {}
                        Object.keys(histItem).forEach(function(key) {
                            if (key !== 'actionArguments') { // actionarguments can contain stuff that's hard to serialize, like dom elements
                                newItem[key] = histItem[key]
                            }
                        })
                        return newItem
                    })
                })
                return ret
            })
            ,({
                history: ___getHist(),
                trackingEnabled: window.trackHistEnabled
            })`, function (res) {
                if (!res) {
                    res = {};
                }
                ReactDom.render(<ElementHistory history={res.history} trackingEnabled={res.trackingEnabled} />, document.querySelector("#app"));   
            });
    }
} else { 

    // data for test page
    setTimeout(function(){
        var h = {
            "className": [
                {
                    "oldValue": "",
                    "newValue": "learn-bar",
                    "actionArguments": [
                        "learn-bar"
                    ],
                    "actionType": "className assignment",
                    "callstack": "    at Learn.append (http://todomvc.com/examples/vanillajs/node_modules/todomvc-common/base.js:223:27)\n    at new Learn (http://todomvc.com/examples/vanillajs/node_modules/todomvc-common/base.js:193:9)\n    at Learn (http://todomvc.com/examples/vanillajs/node_modules/todomvc-common/base.js:156:11)\n    at XMLHttpRequest.xhr.onload (http://todomvc.com/examples/vanillajs/node_modules/todomvc-common/base.js:149:5)",
                    "date": "2017-09-05T16:46:53.940Z",
                    id: 232
                },
                {
                    "actionType": "classList.add call",
                    "actionArguments": [
                        "newclass"
                    ],
                    "oldValue": "learn-bar",
                    "newValue": "learn-bar newclass",
                    "callstack": "    at <anonymous>:1:14",
                    "date": "2017-09-05T16:46:57.222Z",
                    id: 23222
                }
            ],
            "style": [
                {
                    "actionType": "setAttribute call",
                    "actionArguments": [
                        "style",
                        "background: red"
                    ],
                    "oldValue": null,
                    "newValue": "background: red; color: blue; url: url(https://github.com/)",
                    "callstack": "    at <anonymous>:1:4",
                    "date": "2017-09-05T16:46:59.278Z",
                    id: 2311
                }
            ]
        };
        ReactDom.render(<ElementHistory history={h} trackingEnabled={true} />, document.querySelector("#app"));   
    });
}


class ElementHistory extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            expandedHistoryKeys: [],
            searchTerm: ""
        };
    }
    render() {
        if (!this.props.history) {
            let enableTrackingMessage = null;
            let noDataMessage = null;
            if (!this.props.trackingEnabled) {
                enableTrackingMessage = <p>Element history tracking is disabled in this tab - click the orange icon next to the address bar.</p>;
            } else {
                noDataMessage = <div>
                    <p>
                        No history available for this element. Maybe it hasn't changed since page load, or since tracking was enabled?
                    </p>
                    <p>
                        Attribute change not tracked properly? Report missing tracking <a target="_blank" href="https://github.com/mattzeunert/ElementHistory/issues">here</a>.
                    </p>
                </div>;
            }

            return <div style={{padding: 5}}>
                {enableTrackingMessage}
                {noDataMessage}
            </div>;
        }

        let historyKeys = Object.keys(this.props.history);
        historyKeys =  sortBy(historyKeys, function(historyKey){
            if (historyKey === "ElementCreation") {
                return "aaaa";
            }
            if (historyKey === "Insertion") {
                return "aaab";
            }
            // todo: tracke element content, make it second thing
            if (historyKey === "") {

            }
            return historyKey;
        });
        
        let hasItems = false;
        const attributeHistories = historyKeys.map((historyKey) => {
            const isExpanded = this.state.expandedHistoryKeys.includes(historyKey);

            const searchTerm = this.state.searchTerm;
            let visibleHistory = this.props.history[historyKey];
            if (!matchesSearchTerm(historyKey, searchTerm)) {
                visibleHistory = this.props.history[historyKey].filter(function(history) {
                    return (
                        matchesSearchTerm(history.newValue, searchTerm) ||
                        matchesSearchTerm(history.actionType, searchTerm)
                    );
                });
            }
            if (visibleHistory.length > 0) {
                hasItems = true;
            }
            
            return <div className="attribute-history" key={historyKey}>
                <AttributeHistory
                    historyKey={historyKey}
                    history={this.props.history[historyKey]}
                    isExpanded={isExpanded}
                    visibleHistory={visibleHistory}
                    toggleExpanded={() => {
                        if (isExpanded) {
                            this.setState({
                                expandedHistoryKeys: this.state.expandedHistoryKeys.filter(k => k !== historyKey)
                            });
                        } else {
                            this.setState({
                                expandedHistoryKeys: this.state.expandedHistoryKeys.concat([historyKey])
                            });
                        }
                    }}
                />
            </div>;
        });



        return <div>
            <input
                id="search-field"
                type="text"
                placeholder="Filter"
                value={this.state.searchTerm}
                onChange={(e) => this.setState({searchTerm: e.target.value})}></input>
            {attributeHistories}
            {!hasItems && <p style={{padding: 5, borderTop: "1px solid #ddd", margin: 0, color: "#777"}}>
                No matching history items found.
            </p>}
        </div>;
    }
}

function matchesSearchTerm(text, searchTerm) {
    return text.toLowerCase().includes(searchTerm.toLowerCase());
}

class AttributeHistory extends React.Component {
    render() {
        if (this.props.visibleHistory.length === 0) {
            return null;
        }
        
        return <div>
            <div className="attribute-history-title">
                <h2 onClick={() => this.props.toggleExpanded()} style={{display: "inline-block"}}>
                    { /* <div style="attribute-history-arrow">{this.props.isExpanded ? "▲" : "▼"}</div> */ }
                    {this.props.historyKey}
                </h2>
                <div className="most-recent-on-top">most recent on top</div>
            </div>

            <div className="attribute-history-list-container">
                {(this.props.isExpanded || true) ? this.props.visibleHistory.map((history) => {
                    return <AttributeHistoryItem history={history} key={history.id}  />;
                }) : null}
            </div>
        </div>;
    }
}

class AttributeHistoryItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            recentlyPrintedCallstack: false
        };
    }
    render() {
        const history = this.props.history;

        //var frames = ErrorStackParser.parse({stack: history.callstack}) 
        //var fileName = (frames[0].fileName && frames[0].fileName.split("/").pop()) || "<anonymous>"
        let printCallStackButtonText = "Print callstack";
        if (this.state.recentlyPrintedCallstack) {
            printCallStackButtonText = "Printed to console";
        }
        var printCallStackButton = <button className="print-callstack-button">{printCallStackButtonText}</button>;
        let newValue = history.newValue;
        let newValueClassName = "attribute-history-item_new-value ";
        if (newValue === NotApplicable) {
            newValue = "(n/a)";
            newValueClassName += " attribute-history-item_new-value--na";
        } else if (newValue === null) {
            newValueClassName += " attribute-history-item_new-value--null";
            newValue = "null";
        } else {
            newValue = "\"" + newValue + "\"";
        }
        return <div className="attribute-history-item" onClick={() => {
            const historyWithoutCallStack = Object.assign({}, history);
            delete historyWithoutCallStack.callstack;

            if (chrome.devtools) { // don't have that in test.html
                chrome.devtools.inspectedWindow.eval(`
                        var historyItem = JSON.parse(decodeURI("${encodeURI(JSON.stringify(historyWithoutCallStack))}"));
                        var { actionType, date, newValue, oldValue } = historyItem
                        console.log({ actionType, date, newValue, oldValue });
                        console.log(decodeURI("${encodeURI(history.callstack)}"))
                    `);   
            }

            this.setState({ recentlyPrintedCallstack: true });
            setTimeout(() => {
                this.setState({ recentlyPrintedCallstack: false});
            }, 3000);
        }}>
            <div>
                <div className="attribute-history-item_action-type">
                    {history.actionType} {printCallStackButton}
                </div>
                <div className={newValueClassName}>{newValue}</div>
                
            </div>
        </div>;
    }
}

// this migt be useful: chrome.devtools.panels.openResource(string url, integer lineNumber, function callback)
