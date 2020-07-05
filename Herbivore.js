function Herbivore (color = 0) {
  this.name = 'herbivore'
  this.asText = function () { return 'HH' }
  this.tile = {}
  this.color = color
  this.calories = 5

  this.chanceToEat = (herb, food) => {
    let colorDiff = Tools.pacmanDiff(food.color, this.color)
    return Math.ceil((500 - colorDiff) / 5) - 10
  }

  this.die = function () {
    let world = this.tile.world
    world.removeObj(this.key)
  }

  this.eat = function () {
    let food = this.hasFood()
    let chanceToEat = this.chanceToEat(this, food)
    let success = Tools.chance(chanceToEat)
    if (success) {
      let world = food.tile.world
      this.calories += food.size
      world.removeObj(food.key)
    } else {
      this.calories -= 1
    }
    return success
  }

  this.findFood = function () {
    let neighborTiles = this.tile.world.getNeighbors(this.tile.xloc, this.tile.yloc)
    neighborTiles.push(this.tile)
    let nearbyPlants = []
    neighborTiles.forEach(tile => {
      tile.objs.forEach(obj => {
        if (obj.name === 'plant') nearbyPlants.push(obj)
      })
    })
    let reducer = this.getBestFoodReducer(this)
    if (nearbyPlants.length > 0) {
      return nearbyPlants.reduce(reducer)
    }
    return null
  }

  this.onSameTile = (obj1, obj2) => {
    return obj1.tile.xloc === obj2.tile.xloc && obj1.tile.yloc === obj2.tile.yloc
  }

  this.plantHasCompetition = (herb, plant) => {
    if (this.onSameTile(herb, plant)) return false
    return plant.tile.objs.filter(o => o.name === 'herbivore').length > 0
  }

  // compares 2 plants and gives them scores. higher scoring plant is returned
  this.comparePlants = (herb, plant1, plant2) => {
    let score1 = this.chanceToEat(herb, plant1) / 100 * plant1.size
    let score2 = this.chanceToEat(herb, plant2) / 100 * plant2.size
    // add positive modifier if herb is already on the tile
    if (this.onSameTile(herb, plant1)) score1 += 1.1
    if (this.onSameTile(herb, plant2)) score2 += 1.1
    // add negative modifier if plant has a competing herb on it
    if (this.plantHasCompetition(herb, plant1)) score1 -= 2
    if (this.plantHasCompetition(herb, plant2)) score2 -= 2
    // console.log(`plant (${plant1.tile.xloc}, ${plant1.tile.yloc}) has score ${score1}`)
    // console.log(`plant (${plant2.tile.xloc}, ${plant2.tile.yloc}) has score ${score2}`)
    return score1 > score2 ? plant1 : plant2
  }

  // this is the logic for comparing plants and deciding which is the best
  this.getBestFoodReducer = (herb) => {
    let reducer = (currMax, curr) => {
      if (!currMax) return curr
      return this.comparePlants(herb, curr, currMax)
    }
    return reducer
  }

  this.getSize = function () {
    return Math.ceil(this.calories / 2)
  }

  this.hasFood = function () {
    let tilePlants = this.tile.objs.filter(o => o.name === 'plant')
    if (tilePlants.length < 1) return false
    return tilePlants[0]
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

  this.propagate = () => {
    let world = this.tile.world
    let neighborTiles = this.tile.world.getNeighbors(this.tile.xloc, this.tile.yloc)
    let index = Tools.getRand(0, neighborTiles.length - 1)
    let destinationTile = neighborTiles[index]
    let newColor = Tools.mutateColor(this.color, 40)
    world.insertObj(new Herbivore(newColor), destinationTile.xloc, destinationTile.yloc)
    this.calories -= 5
  }

  this.onTimeStep = function () {
    if (this.calories < 1) {
      this.die()
      return
    }
    let food = this.findFood()
    if (food && this.onSameTile(this, food) && this.calories > 2) {
      this.eat()
      return
    }
    if (this.calories > 9) {
      this.propagate()
      return
    }
    if (food) {
      this.move(food.tile)
      return
    }
    this.move()
  }
}

console.log('Herbivore.js loaded')