var React = require("react")
var ReactDom = require("react-dom")



chrome.devtools.panels.elements.onSelectionChanged.addListener(function() {
    chrome.devtools.inspectedWindow.eval("({history: $0.__elementHistory})", function (res) {
        console.log(res && res.history)
        if (res && res.history) {
            ReactDom.render(<ElementHistory history={res.history} />, document.querySelector("#app"))   
        }
        
        
    });
});


    
class ElementHistory extends React.Component {
    render() {
        return <div>
            {Object.keys(this.props.history).map((historyKey) => {
                return <div>
                    <AttributeHistory historyKey={historyKey} history={this.props.history[historyKey]} />
                </div>
            })}
        </div>
    }
}

class AttributeHistory extends React.Component {
    render() {
        return <div>
            {this.props.historyKey}<br/>

            {this.props.history.map(function(history){
                return <div>
                    <div>{history.actionType}: "{history.newValue}"</div>
                </div>
            })}
        </div>
    }
}

// this migt be useful: chrome.devtools.panels.openResource(string url, integer lineNumber, function callback)
