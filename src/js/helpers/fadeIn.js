export default function fadeIn (element, duration = 400) {
  return new Promise(resolve => {
    let _requestID = requestAnimationFrame(animate)
    element.style.display = 'block'
    element.style.opacity = 0
    let start = Date.now()

    function animate () {
      let timestamp = Date.now() - start

      element.style.opacity = (timestamp > duration ? duration : timestamp) / duration

      if (timestamp > duration) {
        cancelAnimationFrame(_requestID)
        return resolve()
      } else {
        _requestID = requestAnimationFrame(animate)
      }
    }
  })
}
