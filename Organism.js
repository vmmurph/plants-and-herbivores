// requires Tools.js

function Herbivore (key, color = 0) {
  this.key = key
  this.name = 'herbivore'
  this.asText = function () { return 'HH' }
  this.tile = {}
  this.color = color
  this.calories = 5

  this.propagate = () => {
    let world = this.tile.world
    let neighborTiles = this.tile.world.getNeighbors(this.tile.xloc, this.tile.yloc)
    let index = Tools.getRand(0, neighborTiles.length - 1)
    let destinationTile = neighborTiles[index]
    world.insertObj(new Herbivore(), destinationTile.xloc, destinationTile.yloc)
    this.calories -= 5
  }

  this.hasFood = function () {
    let tilePlants = this.tile.objs.filter(o => o.name === 'plant')
    if (tilePlants.length < 1) return false
    return tilePlants[0]
  }

  this.eat = function (food) {
    let world = food.tile.world
    this.calories += food.size
    world.removeObj(food.key)
  }

  this.move = function (tile) {
    let world = this.tile.world
    if (tile) {
      world.moveObj(this.key, tile.xloc, tile.yloc)
    } else {
      let neighborTiles = this.tile.world.getNeighbors(this.tile.xloc, this.tile.yloc)
      let index = Tools.getRand(0, neighborTiles.length - 1)
      let destinationTile = neighborTiles[index]
      world.moveObj(this.key, destinationTile.xloc, destinationTile.yloc)
    }
    this.calories -= 1
  }

  this.findFood = function () {
    let neighborTiles = this.tile.world.getNeighbors(this.tile.xloc, this.tile.yloc)
    let nearbyOrganisms = []
    neighborTiles.forEach(tile => {
      tile.objs.forEach(obj => {
        nearbyOrganisms.push(obj)
      })
    })
    let nearbyPlants = nearbyOrganisms.filter(o => o.name === 'plant')
    if (nearbyPlants.length > 0) {
      return nearbyPlants.reduce((currMax, curr) => {
        if (!currMax) return curr
        if (curr.size === currMax.size) {
          return Tools.getRand(0, 1) === 0 ? curr : currMax
        }
        return curr.size > currMax.size ? curr : currMax
      })
    }
    return null
  }

  this.die = function () {
    console.log('herbivore has died')
    let world = this.tile.world
    world.removeObj(this.key)
  }

  this.onTimeStep = function () {
    let food = this.hasFood()
    if (food) {
      this.eat(food)
      return
    }
    if (this.calories < 1) {
      this.die()
      return
    }
    if (this.calories > 9) {
      this.propagate()
      return
    }
    food = this.findFood()
    if (food) {
      this.move(food.tile)
      return
    }
    this.move()
  }
}

function Plant (color = 0) {
  this.name = 'plant'
  this.asText = function () { return 'P' + this.size }
  this.size = 1
  this.tile = {}
  this.color = color
  this.doneGrowing = false

  this.propagate = function () {
    // find an adjacent space that has no objects in it
    let neighbors = this.tile.world.getNeighbors(this.tile.xloc, this.tile.yloc)
    let openNeighbors = neighbors.filter(e => e.objs.length < 1)
    if (openNeighbors.length < 1) return
    // choose one of them randomly
    let index = Tools.getRand(0, openNeighbors.length - 1)
    let chosenTile = openNeighbors[index]
    // chance to grow (ex. 5 means 1 in 5 chance)
    if (Tools.roll(5)) {
      // how fast the plant color mutates
      let newColor = this.color + Tools.getRand(-75, 75)
      // these should correlate to the steps in Tools.getHexColor
      if (newColor < 0) newColor = 999
      if (newColor > 999) newColor = 0

      this.tile.world.insertObj(new Plant(newColor), chosenTile.xloc, chosenTile.yloc)
    }
  }

  this.grow = function () {
    if (this.size < 4 && Tools.roll(50) ) {
      this.size++
    }
  }

  this.onTimeStep = () => {
    this.propagate()
    this.grow()
  }
}

console.log('Organism.js loaded')
