const Tools = function () {
  const roll = (p = 10) => {
    return Math.floor(Math.random() * p) === 0
  }

  /*
   * frequency is a constant that controls how fast the wave oscillates
   * increment is a variable that counts up, typically provided by a loop
   * amplitude controls how high (and low) the wave goes
   * center controls the center position of the wave.
   * phase is an offset
   * steps is how many until there is repetition (ex. with steps = 1000, increment 0 and 1000 will
   *    return the same value)
   * 
   * from https://krazydad.com/tutorials/makecolors.php
   */
  const getColorComponent = (increment = 0, steps, phase = 0) => {
    let frequency = 2 * Math.PI / steps
    let amplitude = 255/2
    let center = 255/2

    // this is our number between 0 and 255
    let component = Math.sin(frequency * increment + phase) * amplitude + center

    return Math.floor(component)
  }

  const toHex = (num) => {
    return num < 16 ? '0' + num.toString(16) : num.toString(16)
  }

  const getHexColor = (i, steps = 1000) => {
    const phaseIncrement = 2 * Math.PI / 3
    const r = getColorComponent(i, steps, 0)
    const g = getColorComponent(i, steps, phaseIncrement)
    const b = getColorComponent(i, steps, phaseIncrement * 2)

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
  }

  // get a random integer in this min/max range inclusive
  const getRand = (min, max) => {
    let range = max - min + 1
    return Math.floor(Math.random() * range) + min
  }

  // TODO
  Array.prototype.shuffle = () => {}

  return {
    roll,
    getHexColor,
    getRand
  }
}()

console.log('Tools.js loaded')