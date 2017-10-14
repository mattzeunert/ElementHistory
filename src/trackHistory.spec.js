function getLastHistoryItem(el, historyKey){
  return el.__elementHistory[historyKey][0]
}

describe("A suite", function() {
  it("It tracks setAttribute calls", function specFunctionName() {
    var el = document.createElement('div')
    function functionName() {
      el.setAttribute('style', 'background: red')
    }
    functionName()
    var lastHistoryItem = getLastHistoryItem(el, 'style')
    expect(lastHistoryItem.actionType).toEqual('setAttribute call')
    expect(lastHistoryItem.actionArguments).toEqual(['style', 'background: red'])
    expect(lastHistoryItem.oldValue).toEqual(null)
    expect(lastHistoryItem.newValue).toEqual('background: red')
    expect(lastHistoryItem.callstack).toContain('specFunctionName')
    expect(lastHistoryItem.date).not.toBe(undefined)
    expect(lastHistoryItem.callstack.split('\n')[0]).toContain("functionName")
  });
  it("Tracks className assignments", function(){
    var el = document.createElement('div')
    el.className += 'cake'
    var lastHistoryItem = getLastHistoryItem(el, 'className')
    expect(lastHistoryItem.actionType).toEqual('className assignment')
    expect(lastHistoryItem.actionArguments).toEqual(['cake'])
    expect(lastHistoryItem.oldValue).toEqual('')
    expect(lastHistoryItem.newValue).toEqual('cake')
  })
  it("Track classList.add calls", function(){
    var el = document.createElement('div')
    el.classList.add('cake')
    var lastHistoryItem = getLastHistoryItem(el, 'className')
    expect(lastHistoryItem.actionType).toEqual('classList.add call')
    expect(lastHistoryItem.actionArguments).toEqual(['cake'])
    expect(lastHistoryItem.oldValue).toEqual('')
    expect(lastHistoryItem.newValue).toEqual('cake')
  })

  describe("Tracks class assignments when creating element by assigning to innerHTML", function(){
    it("", function(){
      var parentEl = document.createElement('div')
      parentEl.innerHTML = '<div class="cake"></div>'
      var el = parentEl.children[0]
      var lastHistoryItem = getLastHistoryItem(el, 'className')
      expect(lastHistoryItem.actionType).toEqual('innerHTML assignment on parent')
      expect(lastHistoryItem.actionArguments).toEqual([parentEl, '<div class="cake"></div>'])
      expect(lastHistoryItem.oldValue).toEqual(null)
      expect(lastHistoryItem.newValue).toEqual('cake')
    })
    it("has correct callstack for nested items", function(){
      var parentEl = document.createElement('div')
      function functionName() {
        parentEl.innerHTML = '<div><span className="sth"></span></div>'
      }
      functionName()
      var el = parentEl.children[0].children[0]
      var lastHistoryItem = getLastHistoryItem(el, 'className')
      expect(lastHistoryItem.callstack.split('\n')[0]).toContain('functionName')
    })
  })


  describe("Tracking element creation", function(){
    it("Tracks when elements are created using createElement", function(){
      var el = document.createElement("span")
      var lastHistoryItem = getLastHistoryItem(el, 'ElementCreation')
      expect(lastHistoryItem.actionType).toBe("document.createElement")
      expect(lastHistoryItem.actionArguments[0]).toBe("span")
      expect(lastHistoryItem.newValue).toBe(NotApplicable)
    })
    it("Tracks when elements are created by innerHTML assignments", function(){
      var parentEl = document.createElement("div")
      parentEl.innerHTML = "<span>Hello <a>World!</a>!</span>"
      var el = parentEl.querySelector("a")
      var lastHistoryItem = getLastHistoryItem(el, 'ElementCreation')
      expect(lastHistoryItem.actionType).toBe("innerHTML assignment on parent")
      expect(lastHistoryItem.actionArguments[1]).toBe("<span>Hello <a>World!</a>!</span>")
      expect(lastHistoryItem.newValue).toBe(NotApplicable)
    })
  })

  it("Tracks when an element is inserted into the DOM with appendChild", function(){
    var parent = document.createElement("div")
    var child = document.createElement("span")
    function functionName() {
      parent.appendChild(child)
    }
    functionName()
    var lastHistoryItem = getLastHistoryItem(child, 'Insertion')
    expect(lastHistoryItem.actionType).toBe("appendChild")
    expect(lastHistoryItem.newValue).toBe(NotApplicable)
    expect(lastHistoryItem.callstack.split('\n')[0]).toContain('functionName')
  })

  describe("jQuery", function(){
    it("Detects where minHeight style was set", function(){
      var el = document.createElement("div")
      $(el).css("min-height", "20px"); // equivalent to el.style.minHeight = "20px"
      var lastHistoryItem = getLastHistoryItem(el, 'style')
      expect(lastHistoryItem.newValue).toBe("min-height: 20px;")
    })
  })

  // todo: make sure classlist and .setAttribute(class) are also tracked under className
});