var React = require("react")
var ReactDom = require("react-dom")
var ErrorStackParser = require("error-stack-parser")

if (chrome.devtools) {
    chrome.devtools.panels.elements.onSelectionChanged.addListener(function() {
        chrome.devtools.inspectedWindow.eval("({history: $0.__elementHistory})", function (res) {
            console.log(res && res.history)
            if (res && res.history) {
                ReactDom.render(<ElementHistory history={res.history} />, document.querySelector("#app"))   
            }
        });
    });
} else {
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
        return <div>
            {Object.keys(this.props.history).map((historyKey) => {
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
        
        return <div >
            <h2 style={{cursor: "pointer"}} onClick={() => this.props.toggleExpanded()}>{this.props.isExpanded ? "▲" : "▼"}{this.props.historyKey}</h2>
            <br/>

            {this.props.isExpanded ? this.props.history.map(function(history){
                 //var frames = ErrorStackParser.parse({stack: history.callstack}) 
                //var fileName = (frames[0].fileName && frames[0].fileName.split("/").pop()) || "<anonymous>"
                return <div style={{marginLeft: 20}} className="attribute-history-item">
                    <div>
                        {history.actionType}: "{history.newValue}"
                        <button onClick={() => {
                            console.log("inspectedwindow", chrome.devtools.inspectedWindow)
                            chrome.devtools.inspectedWindow.eval(`console.log("eval!!!", decodeURI("${encodeURI(history.callstack)}"))`)
                        }}>Print callstack</button>
                    </div>
                </div>
            }) : null}
        </div>
    }
}

// this migt be useful: chrome.devtools.panels.openResource(string url, integer lineNumber, function callback)
