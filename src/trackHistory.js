// Todo
// - some way to print to console by clicking on getter would be useful ---- or, can I show it in sidemenu of elements panel?
// - better tab session tracking, indicator of whether it's on in this tab


var trackingEventTypes = [
    {
        obj: Element.prototype,
        fnName: 'setAttribute',
        getValue(attrName, attrValue) {
            return this.getAttribute(attrName)
        },
        getActionInfo(attrName, attrValue){
            return {
                actionType: 'setAttribute call',
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
    },
    {
        enable: function(){
            var originalDescriptor = Object.getOwnPropertyDescriptor(Element.prototype, 'classList')
            Object.defineProperty(Element.prototype, 'classList', {
                get: function(){
                    var ret = originalDescriptor.get.apply(this, arguments)
                    var originalAdd = ret.add
                    var el = this
                    ret.add = function(){
                        var before = el.className
                        var ret2 = originalAdd.apply(this, arguments)
                        var after = el.className
                        // console.log("called add")

                        addHistoryItem(el, 'className', {
                            actionType: 'classList.add call',
                            actionArguments: Array.from(arguments),
                            oldValue: before,
                            newValue: after
                        })
                        return ret2
                    }
                    return ret
                },
                set: function(){
                    console.log("todo: track set classList")
                    return originalDescriptor.set.apply(this, arguments)
                }
            })
            
        },
        disable: function() {

        }
    },
    {
        enable: function(){
            var originalDescriptor = Object.getOwnPropertyDescriptor(Element.prototype, "innerHTML")
            Object.defineProperty(Element.prototype, "innerHTML", {
                get: function(){
                    return originalDescriptor.get.apply(this, arguments)
                },
                set: function(innerHTML){
                    var ret = originalDescriptor.set.apply(this, arguments)
                    var parentEl = this;
                    iterateOverAllChildren(this, function(child) {
                        addHistoryItem(child, 'className', {
                            actionType: "innerHTML assignment on parent",
                            actionArguments: [parentEl, innerHTML],
                            oldValue: null,
                            newValue: child.className
                        })
                    })
                    return ret
                }
            })
        },
        disable: function() {

        }
    }
]

function iterateOverAllChildren(el, callback){
    el.querySelectorAll("*").forEach(callback)
}

function enableTracking(){
    if (window.trackHistEnabled ) {
        return
    }
    window.trackHistEnabled = true
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
        else if (trackingEventType.obj && trackingEventType.key) {
            var originalDescriptor = Object.getOwnPropertyDescriptor(trackingEventType.obj, trackingEventType.key)
            Object.defineProperty(trackingEventType.obj, trackingEventType.key, {
                get: function(){
                    return originalDescriptor.get.apply(this, arguments)
                },
                set: function(){
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
        } else if (trackingEventType.enable && trackingEventType.disable) {
            trackingEventType.enable()
        }
        else {
            throw "unknown tracking type"
        }
        
    })
    
}
console.log("injected")

function addHistoryItem(element, key, data){
    if (!element.__elementHistory) {
        element.__elementHistory = {}
    }
    if (!element.__elementHistory[key]) {
        element.__elementHistory[key] = []
    }
    data.callstack = Error().stack.split("\n").slice(3).join("\n"),
    data.date = new Date()
    element.__elementHistory[key].unshift(data)
    // console.log("added history", key, data.actionType)
}

function disableTracking(){
    
}

enableTracking()