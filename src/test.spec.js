describe("A suite", function() {
  it("contains spec with an expectation", function specFunctionName() {
    var el = document.createElement('div')
    el.setAttribute('style', 'background: red')
    var styleHistory = el.__elementHistory.style
    var lastHistoryItem = styleHistory[0]
    expect(lastHistoryItem.actionType).toEqual('setAttribute')
    expect(lastHistoryItem.actionArguments).toEqual(['style', 'background: red'])
    expect(lastHistoryItem.oldValue).toEqual(null)
    expect(lastHistoryItem.newValue).toEqual('background: red')
    expect(lastHistoryItem.callstack).toContain('specFunctionName')
  });
});