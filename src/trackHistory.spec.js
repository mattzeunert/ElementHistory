const NotApplicable = "ElementHistory value: not applicable";

function getLastHistoryItem(el, historyKey){
    return el.__elementHistory[historyKey][0];
}

describe("A suite", function() {
    it("It tracks setAttribute calls", function specFunctionName() {
        var el = document.createElement("div");
        function functionName() {
            el.setAttribute("style", "background: red");
        }
        functionName();
        var lastHistoryItem = getLastHistoryItem(el, "style");
        expect(lastHistoryItem.actionType).toEqual("setAttribute call");
        expect(lastHistoryItem.actionArguments).toEqual(["style", "background: red"]);
        expect(lastHistoryItem.oldValue).toEqual(null);
        expect(lastHistoryItem.newValue).toEqual("background: red");
        expect(lastHistoryItem.callstack).toContain("specFunctionName");
        expect(lastHistoryItem.date).not.toBe(undefined);
        expect(lastHistoryItem.callstack.split("\n")[0]).toContain("functionName");
    });
    it("Tracks className assignments", function(){
        var el = document.createElement("div");
        el.className += "cake";
        var lastHistoryItem = getLastHistoryItem(el, "className");
        expect(lastHistoryItem.actionType).toEqual("className assignment");
        expect(lastHistoryItem.actionArguments).toEqual(["cake"]);
        expect(lastHistoryItem.oldValue).toEqual("");
        expect(lastHistoryItem.newValue).toEqual("cake");
    });
    it("Track classList.add calls", function(){
        var el = document.createElement("div");
        el.classList.add("cake");
        var lastHistoryItem = getLastHistoryItem(el, "className");
        expect(lastHistoryItem.actionType).toEqual("classList.add call");
        expect(lastHistoryItem.actionArguments).toEqual(["cake"]);
        expect(lastHistoryItem.oldValue).toEqual("");
        expect(lastHistoryItem.newValue).toEqual("cake");
    });
    it("Tracks classList.toggle calls", function(){
        var el = document.createElement("div");
        el.classList.toggle("cake");
        var lastHistoryItem = getLastHistoryItem(el, "className");
        expect(lastHistoryItem.actionType).toEqual("classList.toggle call");
        expect(lastHistoryItem.actionArguments).toEqual(["cake"]);
        expect(lastHistoryItem.oldValue).toEqual("");
        expect(lastHistoryItem.newValue).toEqual("cake");
    });

    describe("Tracks attributes when creating element by assigning to innerHTML", function(){
        it("Tracks classnames", function(){
            var parentEl = document.createElement("div");
            parentEl.innerHTML = "<div class=\"cake\"></div>";
            var el = parentEl.children[0];
            var lastHistoryItem = getLastHistoryItem(el, "className");
            expect(lastHistoryItem.actionType).toEqual("innerHTML assignment on parent");
            expect(lastHistoryItem.actionArguments).toEqual([parentEl, "<div class=\"cake\"></div>"]);
            expect(lastHistoryItem.oldValue).toEqual(null);
            expect(lastHistoryItem.newValue).toEqual("cake");
        });
        it("Tracks arbitray attributes", function(){
            var parentEl = document.createElement("div");
            parentEl.innerHTML = "<div something=\"cake\"></div>";
            var el = parentEl.children[0];
            var lastHistoryItem = getLastHistoryItem(el, "something");
            expect(lastHistoryItem.actionType).toEqual("innerHTML assignment on parent");
            expect(lastHistoryItem.actionArguments).toEqual([parentEl, "<div something=\"cake\"></div>"]);
            expect(lastHistoryItem.oldValue).toEqual(null);
            expect(lastHistoryItem.newValue).toEqual("cake");
        });
        it("has correct callstack for nested items", function(){
            var parentEl = document.createElement("div");
            function functionName() {
                parentEl.innerHTML = "<div><span class=\"sth\"></span></div>";
            }
            functionName();
            var el = parentEl.children[0].children[0];
            var lastHistoryItem = getLastHistoryItem(el, "className");
            expect(lastHistoryItem.callstack.split("\n")[0]).toContain("functionName");
        });
    });

    describe("input element", function(){
        it("Tracks explicit 'disabled' assignment", function(){
            var el = document.createElement("input");
            el.disabled = true;
      
            var lastHistoryItem = getLastHistoryItem(el, "disabled");
            expect(lastHistoryItem.actionType).toEqual("disabled assignment");
            expect(lastHistoryItem.oldValue).toEqual(false);
            expect(lastHistoryItem.newValue).toEqual(true);
        });
        it("Tracks explicit 'checked' assignment", function(){
            var el = document.createElement("input");
            el.checked = true;
      
            var lastHistoryItem = getLastHistoryItem(el, "checked");
            expect(lastHistoryItem.actionType).toEqual("checked assignment");
            expect(lastHistoryItem.oldValue).toEqual(false);
            expect(lastHistoryItem.newValue).toEqual(true);
        });
        it("Tracks explicit 'disabled' assignment", function(){
            var el = document.createElement("input");
            el.value = "Hello";
      
            var lastHistoryItem = getLastHistoryItem(el, "value");
            expect(lastHistoryItem.actionType).toEqual("value assignment");
            expect(lastHistoryItem.oldValue).toEqual("");
            expect(lastHistoryItem.newValue).toEqual("Hello");
        });
    });


    describe("Tracking element creation", function(){
        it("Tracks when elements are created using createElement", function(){
            var el = document.createElement("span");
            var lastHistoryItem = getLastHistoryItem(el, "ElementCreation");
            expect(lastHistoryItem.actionType).toBe("document.createElement");
            expect(lastHistoryItem.actionArguments[0]).toBe("span");
            expect(lastHistoryItem.newValue).toBe(NotApplicable);
        });
        it("Tracks when elements are created by innerHTML assignments", function(){
            var parentEl = document.createElement("div");
            parentEl.innerHTML = "<span>Hello <a>World!</a>!</span>";
            var el = parentEl.querySelector("a");
            var lastHistoryItem = getLastHistoryItem(el, "ElementCreation");
            expect(lastHistoryItem.actionType).toBe("innerHTML assignment on parent");
            expect(lastHistoryItem.actionArguments[1]).toBe("<span>Hello <a>World!</a>!</span>");
            expect(lastHistoryItem.newValue).toBe(NotApplicable);
        });
    });

    it("Tracks when an element is inserted into the DOM with appendChild", function(){
        var parent = document.createElement("div");
        var child = document.createElement("span");
        function functionName() {
            parent.appendChild(child);
        }
        functionName();
        var lastHistoryItem = getLastHistoryItem(child, "Insertion");
        expect(lastHistoryItem.actionType).toBe("appendChild");
        expect(lastHistoryItem.newValue).toBe(NotApplicable);
        expect(lastHistoryItem.callstack.split("\n")[0]).toContain("functionName");
    });

    describe("jQuery", function(){
        it("Detects where minHeight style was set", function(){
            var el = document.createElement("div");
            $(el).css("min-height", "20px"); // equivalent to el.style.minHeight = "20px"
            var lastHistoryItem = getLastHistoryItem(el, "style");
            expect(lastHistoryItem.newValue).toBe("min-height: 20px;");
        });
    });

    describe("removeAttribute", function() {
        it("Tracks when removeAttribute is called", function(){
            var el = document.createElement("div");
            el.setAttribute("something", "cake");
            el.removeAttribute("something");
            var lastHistoryItem = getLastHistoryItem(el, "something");
            expect(lastHistoryItem.actionType).toEqual("removeAttribute call");
            expect(lastHistoryItem.actionArguments).toEqual(["something"]);
            expect(lastHistoryItem.oldValue).toEqual("cake");
            expect(lastHistoryItem.newValue).toEqual(null);
        });
    });

  
});