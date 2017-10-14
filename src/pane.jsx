const NotApplicable = 'ElementHistory value: not applicable'

var React = require("react")
var ReactDom = require("react-dom")
var ErrorStackParser = require("error-stack-parser")
import {sortBy} from 'lodash'

if (chrome.devtools) {
    update()
    chrome.devtools.panels.elements.onSelectionChanged.addListener(function() {
        update()
    });
    function update(){
        chrome.devtools.inspectedWindow.eval("({history: $0.__elementHistory})", function (res) {
            if (!res) {
                res = {}
            }
            ReactDom.render(<ElementHistory history={res.history} />, document.querySelector("#app"))   
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
                    "date": "2017-09-05T16:46:53.940Z"
                },
                {
                    "actionType": "classList.add call",
                    "actionArguments": [
                        "newclass"
                    ],
                    "oldValue": "learn-bar",
                    "newValue": "learn-bar newclass",
                    "callstack": "    at <anonymous>:1:14",
                    "date": "2017-09-05T16:46:57.222Z"
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
                    "newValue": "background: red",
                    "callstack": "    at <anonymous>:1:4",
                    "date": "2017-09-05T16:46:59.278Z"
                }
            ]
        }
        ReactDom.render(<ElementHistory history={h} />, document.querySelector("#app"))   
    })
}


class ElementHistory extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            expandedHistoryKeys: []
        }
    }
    render() {
        if (!this.props.history) {
            return <div style={{padding: 5}}>
                <p>
                    No history available for this element.
                </p>
                <p>
                    Do you have history collection enabled in this tab? Was it enabled when this element was updated?
                </p>
                {/* todo: i know if user has histoyr collection enabled inthis tab, instead if they don't have it eanbled and there's not histoyr tell them how to enable */}
                <p>
                    Attribute change not tracked properly? Report missing tracking <a target="_blank" href="https://github.com/mattzeunert/ElementHistory/issues">here</a>.
                </p>
            </div>
        }

        let historyKeys = Object.keys(this.props.history)
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
            return historyKey
        })
        


        return <div>
            {historyKeys.map((historyKey) => {
                const isExpanded = this.state.expandedHistoryKeys.includes(historyKey)
                return <div>
                    <AttributeHistory
                        historyKey={historyKey}
                        history={this.props.history[historyKey]}
                        isExpanded={isExpanded}
                        toggleExpanded={() => {
                            if (isExpanded) {
                                this.setState({
                                    expandedHistoryKeys: this.state.expandedHistoryKeys.filter(k => k !== historyKey)
                                })
                            } else {
                                this.setState({
                                    expandedHistoryKeys: this.state.expandedHistoryKeys.concat([historyKey])
                                })
                            }
                        }}
                    />
                </div>
            })}
        </div>
    }
}

class AttributeHistory extends React.Component {
    render() {
        
        return <div>
            <h2 onClick={() => this.props.toggleExpanded()} className="attribute-history-title">
                { /* <div style="attribute-history-arrow">{this.props.isExpanded ? "▲" : "▼"}</div> */ }
                {this.props.historyKey}
            </h2>

            <div className="attribute-history-list-container">
                {(this.props.isExpanded || true) ? this.props.history.map(function(history){
                    //var frames = ErrorStackParser.parse({stack: history.callstack}) 
                    //var fileName = (frames[0].fileName && frames[0].fileName.split("/").pop()) || "<anonymous>"
                    var printCallStackButton = <button className="print-callstack-button" onClick={() => {
                        const historyWithoutCallStack = Object.assign({}, history)
                        delete historyWithoutCallStack.callstack
                        chrome.devtools.inspectedWindow.eval(`console.log(JSON.parse(decodeURI("${encodeURI(JSON.stringify(historyWithoutCallStack))}")));console.log(decodeURI("${encodeURI(history.callstack)}"))`)
                    }}>Print callstack</button>
                    let newValue = history.newValue
                    let newValueClassName = 'attribute-history-item_new-value '
                    if (newValue === NotApplicable) {
                        newValue = '(n/a)'
                        newValueClassName += ' attribute-history-item_new-value--na'
                    } else {
                        newValue = '"' + newValue + '"'
                    }
                    return <div className="attribute-history-item">
                        <div>
                            <div className="attribute-history-item_action-type">
                                {history.actionType} {printCallStackButton}
                            </div>
                            <div className={newValueClassName}>{newValue}</div>
                            
                        </div>
                    </div>
                }) : null}
            </div>
        </div>
    }
}

// this migt be useful: chrome.devtools.panels.openResource(string url, integer lineNumber, function callback)
