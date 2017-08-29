
var trackingEventTypes = [
    {
        obj: Element.prototype,
        fnName: 'setAttribute',
        getValue(attrName, attrValue) {
            return this.getAttribute(attrName)
        },
        getActionInfo(attrName, attrValue){
            return {
                actionType: 'setAttribute',
                historyKey: attrName,
                actionArguments: [attrName, attrValue]
            }
        }
    }
]

function enableTracking(){
    console.log("enable")
    trackingEventTypes.forEach(function(trackingEventType){
        trackingEventType.originalFunction = trackingEventType.obj[trackingEventType.fnName];
        trackingEventType.obj[trackingEventType.fnName] = function(){
            var before = trackingEventType.getValue.apply(this, arguments)
            var actionInfo = trackingEventType.getActionInfo.apply(this, arguments)

            var ret = trackingEventType.originalFunction.apply(this, arguments)
            var after = trackingEventType.getValue.apply(this, arguments)

            addHistoryItem(this, actionInfo.historyKey, {
                actionType: actionInfo.actionType,
                actionArguments: actionInfo.actionArguments,
                oldValue: before,
                newValue: after,
                callstack: Error().stack
            })

            return ret
        }
    })
    
}

function addHistoryItem(element, key, data){
    if (!element.__elementHistory) {
        element.__elementHistory = {}
    }
    if (!element.__elementHistory[key]) {
        element.__elementHistory[key] = []
    }
    element.__elementHistory[key].push(data)
    console.log("added history")
}

function disableTracking(){
    
}

enableTracking()