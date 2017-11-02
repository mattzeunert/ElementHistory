# Element History

Chrome extension that shows you what code created or updated a DOM element.

[Install from Chrome Webstore](https://chrome.google.com/webstore/detail/elementhistory/idhhmihgigngdppfpklkdklfaikkecge)

![](https://user-images.githubusercontent.com/1303660/31585152-97c2c3b0-b182-11e7-8c34-b46a7832ffdb.png)

## How to use the Chrome extension

1. Click on the orange button next to the URL bar. This will enable element history for this tab.

![](https://user-images.githubusercontent.com/1303660/31580908-54e79f08-b122-11e7-9657-87dabf06266b.png)

2. You may want to reload the page to make sure changes made during initial page load are tracked

3. Inspect an element and open the Element History pane

![](https://user-images.githubusercontent.com/1303660/31580906-4167262e-b122-11e7-9406-c0b7fc9ef05a.png)

4. You can now see the history of the selected element

![](https://user-images.githubusercontent.com/1303660/31580915-a74970e6-b122-11e7-8247-ea1b6b4390a2.png)

## Limitations

I'm adding support for individual DOM changes individually, e.g. `innerHTML` or `setAttribute`. That means not all changes will be tracked. If you run into tracking issues you can report them here: https://github.com/mattzeunert/ElementHistory/issues

## Difference to DOM breakpoints

Chrome has a great feature called DOM breakpoints. It'll pause execution, for example when an attribute changes.

Use ElementHistory to:
- see where the element was updated without pausing frequently
- see where an element was created or inserted into the DOM
- see the full history instead of each change one by one

This project is quite useful for plain JavaScript or jQuery code. If you use a framework with a virtual DOM then the place where, for example, the assignment to `innerHTML` happened isn't very interesting.

## Development setup

`npm run install`, then `npm run develop`.

Load the `src` folder into Chrome as an unpacked extension.

Use `npm run test` to run the Karma test suite.

Open `test.html` for quick editing and debugging of the UI.