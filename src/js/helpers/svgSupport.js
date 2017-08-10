let support

export const svgNS = 'http://www.w3.org/2000/svg'
export const svgSupport = function svgSupport () {
  if (support !== undefined) {
    return support
  }
  const div = document.createElement('div')
  div.innerHTML = '<svg/>'
  support = (div.firstChild && div.firstChild.namespaceURI === svgNS)
  return support
}
