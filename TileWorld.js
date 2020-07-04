/*
have an organism object with functions
  asText
  onTimestep
  locx, locy
*/

function Tile (world, xloc = -1, yloc = -1) {
  this.world = world
  this.xloc = xloc
  this.yloc = yloc
  this.key = `(${xloc},${yloc})`
  this.objs = []
}

function TileWorld (width, height) {
  // width (in tiles) of the world
  this.width = width
  // height (in tiles) of the world
  this.height = height
  // 2 dimensional array of all tiles
  this.world = []
  // 1 dimensional array of all tiles
  this.flatWorld = []
  // number of objects (used to create unique keys)
  this.objCounter = 0
  // all objects being tracked
  this.allObjs = []
  // these are objects being timeStepped through
  this.timeStepObjs = []

  for (let x = 0; x < width; x++) {
    this.world[x] = []
    for (let y = 0; y < height; y++) {
      let t = new Tile(this, x, y)
      this.world[x][y] = t
      this.flatWorld.push(t)
    }
  }

  this.getTile = function (x, y) {
    return this.world[x][y]
  }

  this.display = function () {
    let displayString = ''
    for (let y = 0; y < this.world[0].length; y++) {
      for (let x = 0; x < this.world.length; x++) {
        let tile = this.getTile(x, y)
        if (tile.objs[0])
          displayString += tile.objs[0].asText() + ' '
        else
          displayString += '__ '
      }
      displayString += '\n'
    }
    console.log(displayString)
  }

  this.timeStep = function () {
    this.timeStepObjs = []
    this.flatWorld.forEach(tile => {
      tile.objs.forEach(obj => {
        this.timeStepObjs.push(obj)
      })
    })
    this.timeStepObjs.forEach(obj => {
      obj.onTimeStep()
    })
  }

  this.insertObj = function (obj, x, y) {
    let tile = this.getTile(x, y)
    obj.tile = tile
    obj.key = this.getNewKey()
    
    tile.objs.push(obj)
    let listLen = this.allObjs.push(obj)
  }

  this.removeObj = function (key) {
    // remove from allObjs
    let index = this.allObjs.findIndex(e => e.key === key)
    let tile = null
    if (index != -1) {
      let arr = this.allObjs.splice(index, 1)
      tile = arr[0].tile
    }

    // remove from tile obj list
    index = tile.objs.findIndex(e => e.key === key)
    tile.objs.splice(index, 1)

    // remove from timeStepObjs
    index = this.timeStepObjs.findIndex(e => e.key === key)
    this.timeStepObjs.splice(index, 1)
  }

  this.moveObj = function (key, x, y) {
    let obj = this.allObjs.find(e => e.key === key)
    let originTile = obj.tile
    let destinationTile = this.getTile(x, y)

    let index = originTile.objs.findIndex(e => e.key === key)
    originTile.objs.splice(index, index + 1)

    destinationTile.objs.push(obj)
    obj.tile = destinationTile
  }

  this.getNeighbors = function (x, y) {
    let list = []
    if (x > 0) list.push(this.getTile(x-1, y))
    if (y > 0) list.push(this.getTile(x, y-1))
    if (x < width - 1) list.push(this.getTile(x+1, y))
    if (y < height - 1) list.push(this.getTile(x, y+1))
    return list
  }

  this.getNewKey = function() {
    this.objCounter++
    return this.objCounter
  }
}

console.log('TileWorld.js loaded')