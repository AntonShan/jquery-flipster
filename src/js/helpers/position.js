// Functions blow are taken from zepto.js

const rootNodeRE = /^(?:body|html)$/i
const contains = (typeof document !== 'undefined' && document.documentElement.contains)
  ? (parent, node) => (parent !== node && parent.contains(node))
  : (parent, node) => {
    while (node && (node = node.parentNode)) {
      if (node === parent) {
        return true
      }
    }
    return false
  }

export const parseCSSValue = function parseCSSValue (value) {
  return parseFloat(value) || 0
}

export const outerWidth = function outerWidth (element, incMargin = false) {
  const style = getComputedStyle(element)
  let padding = parseCSSValue(style.paddingLeft) + parseCSSValue(style.paddingRight)
  let border = parseCSSValue(style.borderLeftWidth) + parseCSSValue(style.borderRightWidth)
  let margin = parseCSSValue(style.marginLeft) + parseCSSValue(style.marginRight)
  let width = parseCSSValue(style.width)

  let result = width + padding + border

  if (incMargin) {
    result += margin
  }

  return result
}

export const outerHeight = function outerHeight (element, incMargin = false) {
  const style = getComputedStyle(element)
  let padding = parseCSSValue(style.paddingTop) + parseCSSValue(style.paddingBottom)
  let border = parseCSSValue(style.borderTopWidth) + parseCSSValue(style.borderBottomWidth)
  let margin = parseCSSValue(style.marginTop) + parseCSSValue(style.marginBottom)
  let height = parseCSSValue(style.height)

  let result = height + padding + border

  if (incMargin) {
    result += margin
  }

  return result
}

export const offset = function offset (element) {
  if (!element) return null
  if (document.documentElement !== element && !contains(document.documentElement, element)) {
    return {top: 0, left: 0}
  }
  const obj = element.getBoundingClientRect()
  return {
    left: obj.left + window.pageXOffset,
    top: obj.top + window.pageYOffset,
    width: Math.round(obj.width),
    height: Math.round(obj.height)
  }
}

export const offsetParent = function offsetParent (element) {
  let parent = element.offsetParent || document.body
  while (parent && !rootNodeRE.test(parent.nodeName) && getComputedStyle(parent).position === 'static') {
    parent = parent.offsetParent
  }

  return parent
}

export const position = function position (element) {
  if (!element) return

  // Get *real* offsetParent
  let _offsetParent = offsetParent(element)
  // Get correct offsets
  let _offset = offset(element)
  let parentOffset = rootNodeRE.test(_offsetParent.nodeName) ? {top: 0, left: 0} : offset(_offsetParent)

  // Subtract element margins
  // note: when an element has margin: auto the offsetLeft and marginLeft
  // are the same in Safari causing offset.left to incorrectly be 0
  _offset.top -= parseFloat(getComputedStyle(element).marginTop) || 0
  _offset.left -= parseFloat(getComputedStyle(element).marginLeft) || 0

  // Add offsetParent borders
  parentOffset.top += parseFloat(getComputedStyle(_offsetParent).borderTopWidth) || 0
  parentOffset.left += parseFloat(getComputedStyle(_offsetParent).borderLeftWidth) || 0

  // Subtract the two offsets
  return {
    top: _offset.top - parentOffset.top,
    left: _offset.left - parentOffset.left
  }
}

export default position
