function load() {
    var NotApplicable = "ElementHistory value: not applicable";
    let id = 1;
    
    var trackingEventTypes = [
        {
            obj: Element.prototype,
            fnName: "setAttribute",
            getValue(attrName, attrValue) {
                return this.getAttribute(attrName);
            },
            getActionInfo(attrName, attrValue){
                return {
                    actionType: "setAttribute call",
                    historyKey: attrName,
                    actionArguments: [attrName, attrValue]
                };
            }
        },
        {
            obj: HTMLInputElement.prototype,
            keys: ["disabled", "value", "checked"],
            getValue(newValue, key) {
                return this[key];
            },
            getActionInfo(newValue, key) {
                return {
                    actionType: key + " assignment",
                    historyKey: key,
                    actionArguments: newValue
                };
            }
        },
        {
            obj: Element.prototype,
            fnName: "removeAttribute",
            getValue(attrName, attrValue) {
                return this.getAttribute(attrName);
            },
            getActionInfo(attrName){
                return {
                    actionType: "removeAttribute call",
                    historyKey: attrName,
                    actionArguments: [attrName]
                };
            }
        },
        {
            obj: Element.prototype,
            fnName: "appendChild",
            getValue() {
                return NotApplicable;
            },
            getActionInfo(insertedElement) {
                return {
                    actionType: "appendChild",
                    historyKey: "Insertion",
                    actionArguments: [this]
                };
            },
            getElement(insertedElement) {
                return insertedElement;
            }
        },
        {
            originalCreateElement: document.createElement,
            enable: function(){
                originalCreateElement = this.originalCreateElement;
                document.createElement = function(){
                    var el = originalCreateElement.apply(this, arguments);
                    addHistoryItem(el, "ElementCreation", {
                        actionType: "document.createElement",
                        actionArguments: Array.from(arguments),
                        oldValue: NotApplicable,
                        newValue: NotApplicable
                    });
                    return el;
                };
            },
            disable: function(){
    
            }
        },
        {
            obj: Element.prototype,
            keys: ["className"],
            getValue: function(){
                return this.className;
            },
            getActionInfo: function(newValue){
                return {
                    actionType: "className assignment",
                    historyKey: "className",
                    actionArguments: [newValue]
                };
            }
        },
        {
            enable: function(){
                var originalDescriptor = Object.getOwnPropertyDescriptor(Element.prototype, "classList");
                Object.defineProperty(Element.prototype, "classList", {
                    get: function(){
                        var ret = originalDescriptor.get.apply(this, arguments);
                        var originalAdd = ret.add;
                        var el = this;
                        ret.add = function(){
                            var before = el.className;
                            var ret2 = originalAdd.apply(this, arguments);
                            var after = el.className;
                            // console.log("called add")
    
                            addHistoryItem(el, "className", {
                                actionType: "classList.add call",
                                actionArguments: Array.from(arguments),
                                oldValue: before,
                                newValue: after
                            });
                            return ret2;
                        };
                        return ret;
                    },
                    set: function(){
                        console.log("todo: track set classList");
                        return originalDescriptor.set.apply(this, arguments);
                    }
                });
                
            },
            disable: function() {
    
            }
        },
        {
            enable: function(){
                var originalDescriptor = Object.getOwnPropertyDescriptor(Element.prototype, "innerHTML");
                Object.defineProperty(Element.prototype, "innerHTML", {
                    get: function(){
                        return originalDescriptor.get.apply(this, arguments);
                    },
                    set: function(innerHTML){
                        var error = Error();
                        var ret = originalDescriptor.set.apply(this, arguments);
                        var parentEl = this;
                        iterateOverAllChildren(this, function(child) {
                            Array.from(child.attributes).forEach(function(attr){
                                var name = attr.name;
                                addHistoryItem(child, name, {
                                    actionType: "innerHTML assignment on parent",
                                    actionArguments: [parentEl, innerHTML],
                                    oldValue: null,
                                    newValue: attr.value,
                                    error: error
                                });
                            });
                            addHistoryItem(child, "ElementCreation", {
                                actionType: "innerHTML assignment on parent",
                                actionArguments: [parentEl, innerHTML],
                                oldValue: null,
                                newValue: NotApplicable,
                                error: error
                            });
                        });
                        return ret;
                    }
                });
            },
            disable: function() {
                
            }
        },
        {
            enable: function(){
                var originalDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "style");
                Object.defineProperty(HTMLElement.prototype, "style", {
                    get: function(){
                        const style = originalDescriptor.get.apply(this, arguments);
                        var el = this;
                        return new Proxy(style, {
                            get(target, propKey, receiver) {
                                return target[propKey];
                            },
                            set(target, propKey, value, receiver) {
                                const origMethod = target[propKey];
                                const before = el.getAttribute("style");
                                target[propKey] = value;
                                const after = el.getAttribute("style");
                                addHistoryItem(el, "style", {
                                    actionType: "assign .style." + propKey,
                                    actionArguments: [value],
                                    oldValue: before,
                                    newValue: after
                                });
                                // Return true, even thoug it's not super accurate
                                // """
                                // The set method should return a boolean value. Return true to indicate that assignment succeeded.
                                // If the set method returns false, and the assignment happened in strict-mode code, a TypeError will be thrown.
                                // """ - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/handler/set
                                return true;
                            }
                        });                    
                    },
                    set: function(){
                        return originalDescriptor.set.apply(this, arguments);
                    }
                });
            },
            disable: function(){
    
            }
        }
    ];
    
    function iterateOverAllChildren(el, callback){
        el.querySelectorAll("*").forEach(callback);
    }
    
    function enableTracking(){
        if (window.trackHistEnabled) {
            return;
        }
        Error.stackTraceLimit = Infinity;
        window.trackHistEnabled = true;
        console.log("Enabling ElementHistory tracking");
        trackingEventTypes.forEach(function(trackingEventType){
            if (trackingEventType.obj && trackingEventType.fnName) {
                trackingEventType.originalFunction = trackingEventType.obj[trackingEventType.fnName];
                trackingEventType.obj[trackingEventType.fnName] = function(){
                    var before = trackingEventType.getValue.apply(this, arguments);
                    var actionInfo = trackingEventType.getActionInfo.apply(this, arguments);
        
                    var ret = trackingEventType.originalFunction.apply(this, arguments);
                    var after = trackingEventType.getValue.apply(this, arguments);
    
                    var element = this;
                    if (trackingEventType.getElement) {
                        element = trackingEventType.getElement.apply(this, arguments);
                    }
        
                    addHistoryItem(element, actionInfo.historyKey, {
                        actionType: actionInfo.actionType,
                        actionArguments: actionInfo.actionArguments,
                        oldValue: before,
                        newValue: after
                    });
        
                    return ret;
                };
            }
            else if (trackingEventType.obj && trackingEventType.keys) {
                trackingEventType.keys.forEach(function(key) {
                    var originalDescriptor = Object.getOwnPropertyDescriptor(trackingEventType.obj, key);
                    Object.defineProperty(trackingEventType.obj, key, {
                        get: function(){
                            return originalDescriptor.get.apply(this, arguments);
                        },
                        set: function(){
                            var argsAndKey = [...arguments, key];
                            var before = trackingEventType.getValue.apply(this, argsAndKey);
                            var actionInfo = trackingEventType.getActionInfo.apply(this, argsAndKey);                        
                            var ret = originalDescriptor.set.apply(this, argsAndKey);
                            var after = trackingEventType.getValue.apply(this, argsAndKey);
                            addHistoryItem(this, actionInfo.historyKey, {
                                oldValue: before,
                                newValue: after,
                                actionArguments: actionInfo.actionArguments,
                                actionType: actionInfo.actionType
                            });
                            return ret;
                        }
                    });
                });
            } else if (trackingEventType.enable && trackingEventType.disable) {
                trackingEventType.enable();
            }
            else {
                throw "unknown tracking type";
            }
            
        });
        
    }
    
    
    function addHistoryItem(element, key, data){
        if (key === "class") {
            key = "className";
        }
        if (!element.__elementHistory) {
            element.__elementHistory = {};
        }
        if (!element.__elementHistory[key]) {
            element.__elementHistory[key] = [];
        }
        if (data.error) {
            data.callstack = data.error.stack.split("\n").slice(2).join("\n");
            delete data.errors;
        }
        else {
            data.callstack = Error().stack.split("\n").slice(3).join("\n");
        }
        data.id = id++;
        data.date = new Date().toString();
        element.__elementHistory[key].unshift(data);

        // code for detecting lack of tracking
        /*
        if (element.__elementHistory[key].length > 1) {
            if (key !== 'disabled') { // disabled has some acceptable inconsistencies between el.disabled and el.setAttr('disabled', ...)
                var previousHistoryItem = element.__elementHistory[key][1]
                if (previousHistoryItem.newValue !== data.oldValue) {
                    // something wasn't tracked
                    debugger
                }
            }
        }
        */
    }
    
    function disableTracking(){
        throw "todo";
    }
    
    enableTracking();
    window.elementHistoryLoaded = true;
}

if (!window.elementHistoryLoaded) {
    load();
}