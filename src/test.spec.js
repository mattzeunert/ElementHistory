function getLastHistoryItem(el, historyKey){
  return el.__elementHistory[historyKey][0]
}

describe("A suite", function() {
  it("It tracks setAttribute calls", function specFunctionName() {
    var el = document.createElement('div')
    el.setAttribute('style', 'background: red')
    var lastHistoryItem = getLastHistoryItem(el, 'style')
    expect(lastHistoryItem.actionType).toEqual('setAttribute')
    expect(lastHistoryItem.actionArguments).toEqual(['style', 'background: red'])
    expect(lastHistoryItem.oldValue).toEqual(null)
    expect(lastHistoryItem.newValue).toEqual('background: red')
    expect(lastHistoryItem.callstack).toContain('specFunctionName')
    expect(lastHistoryItem.date).not.toBe(undefined)
  });
  it("Tracks className assignemnts", function(){
    var el = document.createElement('div')
    el.className += 'cake'
    var lastHistoryItem = getLastHistoryItem(el, 'className')
    expect(lastHistoryItem.actionType).toEqual('className assignment')
    expect(lastHistoryItem.actionArguments).toEqual(['cake'])
    expect(lastHistoryItem.oldValue).toEqual('')
    expect(lastHistoryItem.newValue).toEqual('cake')
  })

  // todo: make sure classlist and .setAttribute(class) are also tracked under className
});