
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
    },
    {
        obj: Element.prototype,
        key: 'className',
        getValue: function(){
            return this.className
        },
        getActionInfo: function(newValue){
            return {
                actionType: 'className assignment',
                historyKey: 'className',
                actionArguments: [newValue]
            }
        }
    }
]

function enableTracking(){
    console.log("enable")
    trackingEventTypes.forEach(function(trackingEventType){
        if (trackingEventType.obj && trackingEventType.fnName) {
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
                    newValue: after
                })
    
                return ret
            }
        }
        if (trackingEventType.obj && trackingEventType.key) {
            var originalDescriptor = Object.getOwnPropertyDescriptor(trackingEventType.obj, trackingEventType.key)
            Object.defineProperty(trackingEventType.obj, trackingEventType.key, {
                get: function(){
                    return originalDescriptor.get.apply(this, arguments)
                },
                set: function(){
                    console.log("set classname")
                    var before = trackingEventType.getValue.apply(this, arguments)
                    var actionInfo = trackingEventType.getActionInfo.apply(this, arguments)                        
                    var ret = originalDescriptor.set.apply(this, arguments)
                    var after = trackingEventType.getValue.apply(this, arguments)
                    addHistoryItem(this, actionInfo.historyKey, {
                        oldValue: before,
                        newValue: after,
                        actionArguments: actionInfo.actionArguments,
                        actionType: actionInfo.actionType
                    })
                    return ret
                }
            })
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
    data.callstack = Error().stack,
    data.date = new Date()
    element.__elementHistory[key].push(data)
    console.log("added history", key, data.actionType)
}

function disableTracking(){
    
}

enableTracking()