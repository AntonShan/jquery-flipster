Flipster
===============

Mostly the same as original [Flipster](https://github.com/drien/jquery-flipster) but works without jQuery.

Differences from original Flipster are:
- Works without jQuery but has lodash as dependency
- Removed box-reflect from styles which absolutely killed performance in my case (This feature is not intended to be used by Web sites. To achieve reflection on the Web, the standard way is to use the CSS element() function. - [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/-webkit-box-reflect))


Basic Usage
---------------

**Step 1**: Include Flipster's CSS, typically in the `<head>`:
```html
<link rel="stylesheet" href="css/flipster.min.css">
```
*Tip: Use the un-minified `flipster.css` or the LESS files in the `src/less` folder to make your own Flipster styles!*

**Step 2**: Set up your content:
```html
<div class="my-flipster">
  <ul>
    <li><img src="" /></li>
    <li><p>Plain ol' <abbr>HTML</abbr>!</p></li>
    ...
  </ul>
</div>
```

*Tip: Set the `itemContainer` and `itemSelector` options to fit your markup. Flipster only requires an outer container and inner container; you aren't restricted to `<div>`, `<ul>`, and `<li>`s. *

**Step 3**: Include Flipster's Javascript after jQuery (ideally at the bottom of the page before the `</body>` tag) and initialize Flipster on your element:
```html
<script src="/js/flipster.min.js"></script>
<script>
    flipster(document.querySelector('.my-flipster'));
</script>
```

**Step 4**: Start flippin'!


Options
---------------

Configure your options when first initializing Flipster. Default values and descriptions are shown below.
```javascript  
flipster(document.querySelector('.my-flipster'), {
    itemContainer: 'ul',
    // [string|object]
    // Selector for the container of the flippin' items.

    itemSelector: 'li',
    // [string|object]
    // Selector for children of `itemContainer` to flip

    start: 'center',
    // ['center'|number]
    // Zero based index of the starting item, or use 'center' to start in the middle

    fadeIn: 400,
    // [milliseconds]
    // Speed of the fade in animation after items have been setup

    loop: false,
    // [true|false]
    // Loop around when the start or end is reached

    autoplay: false,
    // [false|milliseconds]
    // If a positive number, Flipster will automatically advance to next item after that number of milliseconds

    pauseOnHover: true,
    // [true|false]
    // If true, autoplay advancement will pause when Flipster is hovered

    style: 'coverflow',
    // [coverflow|carousel|flat|...]
    // Adds a class (e.g. flipster--coverflow) to the flipster element to switch between display styles
    // Create your own theme in CSS and use this setting to have Flipster add the custom class

    spacing: -0.6,
    // [number]
    // Space between items relative to each item's width. 0 for no spacing, negative values to overlap

    click: true,
    // [true|false]
    // Clicking an item switches to that item

    keyboard: true,
    // [true|false]
    // Enable left/right arrow navigation

    scrollwheel: true,
    // [true|false]
    // Enable mousewheel/trackpad navigation; up/left = previous, down/right = next

    touch: true,
    // [true|false]
    // Enable swipe navigation for touch devices

    nav: false,
    // [true|false|'before'|'after']
    // If not false, Flipster will build an unordered list of the items
    // Values true or 'before' will insert the navigation before the items, 'after' will append the navigation after the items

    buttons: false,
    // [true|false|'custom']
    // If true, Flipster will insert Previous / Next buttons with SVG arrows
    // If 'custom', Flipster will not insert the arrows and will instead use the values of `buttonPrev` and `buttonNext`

    buttonPrev: 'Previous',
    // [text|html]
    // Changes the text for the Previous button

    buttonNext: 'Next',
    // [text|html]
    // Changes the text for the Next button

    onItemSwitch: false
    // [function]
    // Callback function when items are switched
    // Arguments received: [currentItem, previousItem]
});
```

