function Herbivore (color = 0) {
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
    let newColor = Tools.mutateColor(this.color, 40)
    world.insertObj(new Herbivore(newColor), destinationTile.xloc, destinationTile.yloc)
    this.calories -= 5
  }

  this.hasFood = function () {
    let tilePlants = this.tile.objs.filter(o => o.name === 'plant')
    if (tilePlants.length < 1) return false
    return tilePlants[0]
  }

  this.chanceToEat = (herb, food) => {
    let colorDiff = Tools.pacmanDiff(food.color, this.color)
    return Math.ceil((500 - colorDiff) / 5)
  }

  this.eat = function (food) {
    let chanceToEat = this.chanceToEat(this, food)
    let success = Tools.chance(chanceToEat)
    if (success) {
      let world = food.tile.world
      this.calories += food.size
      world.removeObj(food.key)
    } else {
      this.calories -= 1
    }
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

  this.getBestFoodReducer = (herb) => {
    let reducer = (currMax, curr) => {
      if (!currMax) return curr
      if (this.chanceToEat(herb, curr) * curr.size > this.chanceToEat(herb, currMax) * currMax.size) {
        return curr
      }
      return currMax
    }
    return reducer
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
    let reducer = this.getBestFoodReducer(this)
    if (nearbyPlants.length > 0) {
      return nearbyPlants.reduce(reducer)
    }
    return null
  }

  this.die = function () {
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

console.log('Herbivore.js loaded')