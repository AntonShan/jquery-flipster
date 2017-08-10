import throttle from 'lodash/throttle'
import extend from 'lodash/extend'
import fadeIn from './js/helpers/fadeIn'
import {svgNSб, svgSupport} from './js/helpers/svgSupport'
import position from './js/helpers/position'

const defaults = {
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
  // [true|false|number]
  // Loop around when the start or end is reached
  // If number, this is the number of items that will be shown when the beginning or end is reached

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
}

const classes = {
  main: 'flipster',
  active: 'flipster--active',
  container: 'flipster__container',

  nav: 'flipster__nav',
  navChild: 'flipster__nav__child',
  navItem: 'flipster__nav__item',
  navLink: 'flipster__nav__link',
  navCurrent: 'flipster__nav__item--current',
  navCategory: 'flipster__nav__item--category',
  navCategoryLink: 'flipster__nav__link--category',

  button: 'flipster__button',
  buttonPrev: 'flipster__button--prev',
  buttonNext: 'flipster__button--next',

  item: 'flipster__item',
  itemCurrent: 'flipster__item--current',
  itemPast: 'flipster__item--past',
  itemFuture: 'flipster__item--future',
  itemContent: 'flipster__item__content'
}

export default function flipster (element, options) {
  const isMethodCall = (typeof options === 'string')

  const settings = extend({}, defaults, options)

  let _container
  let _containerWidth

  let _items
  let _itemOffsets = []
  let _currentItem
  let _currentIndex = 0

  let _nav
  let _navItems
  let _navLinks

  let _playing = false
  let _startDrag = false
  const removableClasses = [
    classes.itemCurrent,
    classes.itemPast,
    classes.itemFuture
  ]

  function buildButtonContent (dir) {
    const text = (dir === 'next' ? settings.buttonNext : settings.buttonPrev)

    if (settings.buttons === 'custom' || !svgSupport) {
      return text
    }

    return `
        <svg viewBox="0 0 13 20" xmlns="${svgNS}" aria-labelledby="title">
          <title>${text}</title>
          <polyline points="10,3 3,10 10,17" ${(dir === 'next' ? ' transform="rotate(180 6.5,10)"' : '')}/>
        </svg>`
  }

  function buildButton (dir) {
    dir = dir || 'next'
    const button = document.createElement('button')
    button.classList.add(classes.button)
    button.classList.add(dir === 'next' ? classes.buttonNext : classes.buttonPrev)
    button.role = 'button'
    button.innerHTML = buildButtonContent(dir)
    button.addEventListener('click', function (e) {
      jump(dir)
      e.preventDefault()
    })

    return button
  }

  function buildButtons () {
    if (settings.buttons && _items.length > 1) {
      let buttons = element.querySelectorAll('.' + classes.button)
      Array.prototype.forEach.call(buttons, el => el.remove())
      element.appendChild(buildButton('prev'))
      element.appendChild(buildButton('next'))
    }
  }

  function buildNav () {
    const navCategories = {}

    if (!settings.nav || _items.length <= 1) {
      return
    }

    if (_nav) {
      _nav.remove()
    }

    _nav = document.createElement('ul')
    _nav.classList.add(classes.nav)
    _nav.role = 'navigation'
    _navLinks = []

    _items.forEach(function (item, index) {
      let category = item.dataset.flipCategory
      let itemTitle = item.dataset.flipTitle || item.getAttribute('title') || index
      let navLink = document.createElement('a')
      navLink.href = '#'
      navLink.classList.add(classes.navLink)
      navLink.innerText = itemTitle
      navLink.dataset.index = index

      _navLinks.push(navLink)

      if (category) {
        if (!navCategories[category]) {
          const categoryItem = document.createElement('li')
          categoryItem.classList.add(classes.navItem)
          categoryItem.classList.add(classes.navCategory)
          const categoryLink = document.createElement('a')
          categoryLink.classList.add(classes.navLink)
          categoryLink.classList.add(classes.navCategoryLink)
          category.dataset.flipCategory = category
          category.innerHTML = category
          category.dataset.category = category
          category.dataset.index = index

          navCategories[category] = document.createElement('ul')
          navCategories[category].classList.add(classes.navChild)

          _navLinks.push(categoryLink)

          categoryItem.appendChild(categoryLink)
          categoryItem.appendChild(navCategories[category])
          _nav.appendChild(categoryItem)
        }

        navCategories[category].appendChild(navLink)
      } else {
        const wrapper = document.createElement('li')
        wrapper.classList.add(classes.navItem)
        wrapper.appendChild(navLink)
        _nav.appendChild(wrapper)
        return
      }

      const wrapper = document.createElement('li')
      wrapper.classList.add(classes.navItem)
      wrapper.appendChild(navLink)
    })

    _nav.addEventListener('click', function (e) {
      const target = e.target
      if (target && target.matches('a')) {
        const index = +target.dataset.index

        if (isNaN(index)) {
          throw new Error('Index of the slide is not a number')
        }

        if (index >= 0) {
          jump(index)
          e.preventDefault()
        }
      }
    })

    if (settings.nav === 'after') {
      element.appendChild(_nav)
    } else {
      element.prepend(_nav)
    }

    _navItems = _nav.querySelectorAll(`.${classes.navItem}`)
  }

  function updateNav () {
    if (settings.nav) {
      const category = _currentItem.dataset.flipCategory

      Array.prototype.forEach.call(_navItems, item => item.classList.remove(classes.navCurrent))

      const filteredElements = Array.prototype.filter.call(_navLinks, link => {
        return Number(link.dataset.index) === _currentIndex || (category && link.dataset.category === category)
      })

      filteredElements.forEach(e => {
        e.parentElement.classList.add(classes.navCurrent)
      })
    }
  }

  function noTransition () {
    [element, _container].concat(_items).forEach(e => {
      e.style.transition = 'none'
    })
  }

  function resetTransition () {
    [element, _container].concat(_items).forEach(e => {
      e.style.transition = ''
    })
  }

  function calculateBiggestItemHeight () {
    return Math.max.apply(Math, _items.map(item => {
      return Math.max(item.offsetParent, getComputedStyle(item).height)
    }))
  }

  function removeFlipsterClasses (el) {
    let flipsterClasses = Array.prototype.filter.call(
      el.classList,
      c => removableClasses.some(i => c.startsWith(i))
    )

    flipsterClasses.forEach(c => el.classList.remove(c))
    return el
  }

  function resize (skipTransition) {
    if (skipTransition) {
      noTransition()
    }

    _containerWidth = _container.offsetWidth
    _container.style.height = calculateBiggestItemHeight()

    _items.forEach(function (item, index) {
      let width
      let left

      removeFlipsterClasses(item)

      width = item.offsetWidth

      if (settings.spacing !== 0) {
        item.style.marginRight = (width * settings.spacing) + 'px'
      }

      left = position(item).left
      _itemOffsets[index] = -1 * ((left + (width / 2)) - (_containerWidth / 2))

      if (index === _items.length - 1) {
        center()
        if (skipTransition) {
          setTimeout(resetTransition, 1)
        }
      }
    })
  }

  function center () {
    const total = _items.length
    let loopCount = (settings.loop !== true && settings.loop > 0 ? settings.loop : false)

    if (_currentIndex >= 0) {
      _items.forEach(function (item, index) {
        let zIndex
        let newClass = ' '

        if (index === _currentIndex) {
          newClass += classes.itemCurrent
          zIndex = (total + 2)
        } else {
          let past = index < _currentIndex
          let offset = (past ? _currentIndex - index : index - _currentIndex)

          if (loopCount) {
            if (_currentIndex <= loopCount && index > _currentIndex + loopCount) {
              newClass = ' '
              past = true
              offset = (total + _currentIndex) - index
            } else if (_currentIndex >= total - loopCount && index < _currentIndex - loopCount) {
              past = false
              offset = (total - _currentIndex) + index
            }
          }
          newClass += (past
              ? classes.itemPast + ' ' + classes.itemPast + '-' + offset
              : classes.itemFuture + ' ' + classes.itemFuture + '-' + offset
          )

          zIndex = total - offset
        }

        item.style.zIndex = zIndex * 2

        removeFlipsterClasses(item)

        newClass
          .split(' ')
          .filter(c => c.length > 0)
          .forEach(c => item.classList.add(c))
      })
      //
      // if (!_containerWidth || _itemOffsets[_currentIndex] === undefined) {
      //   resize(true)
      // }

      _container.style.transform = `translateX(${_itemOffsets[_currentIndex]}px)`
    }

    updateNav()
  }

  function jump (to) {
    const _previous = _currentIndex

    if (_items.length <= 1) {
      return
    }

    if (to === 'prev') {
      if (_currentIndex > 0) {
        _currentIndex--
      } else if (settings.loop) {
        _currentIndex = _items.length - 1
      }
    } else if (to === 'next') {
      if (_currentIndex < _items.length - 1) {
        _currentIndex++
      } else if (settings.loop) {
        _currentIndex = 0
      }
    } else if (typeof to === 'number') {
      _currentIndex = to
    } else if (to !== undefined) {
      // if object is sent, get its index
      _currentIndex = _items.indexOf(to)
    }

    _currentItem = _items[_currentIndex]

    if (typeof settings.onItemSwitch === 'function') {
      settings.onItemSwitch.call(element, _items[_currentIndex], _items[_previous], _currentIndex, _previous)
    }

    center()

    return element
  }

  function play (interval) {
    settings.autoplay = interval || settings.autoplay

    clearInterval(_playing)

    _playing = setInterval(function () {
      const prev = _currentIndex
      jump('next')
      if (prev === _currentIndex && !settings.loop) {
        clearInterval(_playing)
      }
    }, settings.autoplay)

    return element
  }

  function pause () {
    if (settings.autoplay) {
      _playing = -1
    }
    return element
  }

  function show () {
    resize(true)
    element.style.display = 'none'
    element.style.visibility = ''
    element.classList.add(classes.active)
    fadeIn(element)
  }

  function index () {
    _container = element.querySelector(settings.itemContainer)
    if (_container === null) {
      return
    }

    _container.classList.add(classes.container)

    _items = Array.prototype.reduce.call(
      _container.querySelectorAll(settings.itemSelector),
      (acc, item) => acc.concat(item),
      []
    )

    if (_items.length <= 1) {
      return
    }

    _items.forEach(item => {
      item.classList.add(classes.item)
      const children = Array.prototype.filter.call(
        item.children,
        child => child.matches(`.${classes.itemContent}`)
      )

      if (!children.length) {
        const wrapper = document.createElement('div')
        wrapper.classList.add(classes.itemContent)

        Array.prototype.forEach.call(item.children, c => {
          wrapper.appendChild(c.cloneNode(true))
          item.removeChild(c)
        })
        item.appendChild(wrapper)
      }
    })

    // Navigate directly to an item by clicking
    if (settings.click) {
      [
        'click',
        'touchend'
      ].forEach(event => {
        _items.forEach(item => {
          item.addEventListener(event, function (e) {
            if (!_startDrag) {
              if (!item.classList.contains(classes.itemCurrent)) {
                e.preventDefault()
              }
              jump(this)
            }
          })
        })
      })
    }

    // Insert navigation if enabled.
    buildButtons()
    buildNav()

    if (_currentIndex >= 0) {
      jump(_currentIndex)
    }

    return element
  }

  function keyboardEvents (elem) {
    if (settings.keyboard) {
      elem.tabIndex = 0
      elem.addEventListener('keydown', throttle(function (e) {
        const code = e.which
        if (code === 37 || code === 39) {
          jump(code === 37 ? 'prev' : 'next')
          e.preventDefault()
        }
      }, 250, true))
    }
  }

  function wheelEvents (elem) {
    if (settings.scrollwheel) {
      let _actionThrottle = 0
      let _throttleTimeout = 0
      let _delta = 0
      let _dir
      let _lastDir

      const mousewheelEvents = ['mousewheel', 'wheel']

      mousewheelEvents.forEach(
        event => {
          elem.addEventListener(event, throttle(function (e) {
            e.preventDefault()
            e.stopPropagation()
            // Reset after a period without scrolling.
            clearTimeout(_throttleTimeout)
            _throttleTimeout = setTimeout(function () {
              _actionThrottle = 0
              _delta = 0
            }, 300)

            // Add to delta (+=) so that continuous small events can still get past the speed limit, and quick direction reversals get cancelled out
            _delta += (e.wheelDelta || (e.deltaY + e.deltaX) * -1) // Invert numbers for Firefox

            // Don't trigger unless the scroll is decent speed.
            if (Math.abs(_delta) < 25) {
              return
            }

            _actionThrottle++

            _dir = (_delta > 0 ? 'prev' : 'next')

            // Reset throttle if direction changed.
            if (_lastDir !== _dir) {
              _actionThrottle = 0
            }
            _lastDir = _dir

            // Regular scroll wheels trigger less events, so they don't need to be throttled. Trackpads trigger many events (inertia), so only trigger jump every three times to slow things down.
            if (_actionThrottle < 6 || _actionThrottle % 3 === 0) {
              jump(_dir)
            }

            _delta = 0
          }, 50))
        }
      )
    }
  }

  function touchEvents (elem) {
    if (settings.touch) {
      let _startDragY = false
      let _touchJump = throttle(jump, 300)
      let x
      let y
      let offsetY
      let offsetX

      const touchstartEvent = 'touchstart'
      const touchmoveEvent = 'touchmove'
      const touchendEvents = ['touchend', 'touchcancel']

      elem.addEventListener(touchstartEvent, function (e) {
        _startDrag = (e.touches ? e.touches[0].clientX : e.clientX)
        _startDragY = (e.touches ? e.touches[0].clientY : e.clientY)
        // e.preventDefault()
      }, {passive: true})

      elem.addEventListener(touchmoveEvent, throttle(function (e) {
        if (_startDrag !== false) {
          x = (e.touches ? e.touches[0].clientX : e.clientX)
          y = (e.touches ? e.touches[0].clientY : e.clientY)
          offsetY = y - _startDragY
          offsetX = x - _startDrag

          if (Math.abs(offsetY) < 100 && Math.abs(offsetX) >= 30) {
            _touchJump((offsetX < 0 ? 'next' : 'prev'))
            _startDrag = x
            e.preventDefault()
          }
        }
      }, 100), {passive: true})

      touchendEvents.forEach(event => elem.addEventListener(event, function () {
        _startDrag = false
      }))
    }
  }

  async function loadImages (images) {
    const promises = Array.prototype.map.call(images, image => {
      return new Promise(resolve => {
        image.addEventListener('onload', resolve)
        setTimeout(resolve, 750)
      })
    })

    await Promise.all(promises)
    show()
  }

  async function init () {
    element.style.visibility = 'hidden'

    index()

    if (_items.length <= 1) {
      element.style.visibility = ''
      return
    }

    let style = (settings.style ? 'flipster--' + settings.style.split(' ').join(' flipster--') : false)

    const elementClasses = [
      classes.main,
      'flipster--transform',
      style,
      (settings.click ? 'flipster--click' : '')
    ]
    elementClasses.forEach(_class => element.classList.add(_class))

    // Set the starting item
    if (settings.start) {
      // Find the middle item if start = center
      _currentIndex = (settings.start === 'center' ? Math.floor(_items.length / 2) : settings.start)
    }

    jump(_currentIndex)

    let images = element.querySelectorAll('img')

    if (images.length > 0) {
      await loadImages(images)
    } else {
      show()
    }

    // Attach event bindings.
    window.addEventListener('resize', throttle(resize, 400))

    if (settings.autoplay) {
      play()
    }

    if (settings.pauseOnHover) {
      _container.addEventListener('mouseenter', pause)

      _container.addEventListener('mouseenter', function () {
        if (_playing === -1) {
          play()
        }
      })
    }

    keyboardEvents(element)
    wheelEvents(_container)
    touchEvents(_container)
  }

  // Initialize if flipster is not already active.
  if (!element.classList.contains(classes.active)) {
    init()
  }
}