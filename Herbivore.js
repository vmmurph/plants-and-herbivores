class Herbivore {
  name = 'herbivore'
  movementCost = 1
  eatCost = 1
  mutationFactor = 35
  
  constructor (color = 0, calories = 10, gestation = 20) {
    this.color = color
    this.calories = calories
    // how many calorie points to accumulate before propagating
    this.gestation = gestation
  }

  asText () { return 'HH' }

  chanceToEat (herb, food) {
    let colorDiff = Tools.pacmanDiff(food.color, herb.color)
    return Math.ceil((500 - colorDiff) / 5) - 10
  }

  eat () {
    let food = this.onFood()
    let chanceToEat = this.chanceToEat(this, food)
    let success = Tools.chance(chanceToEat)
    if (success) {
      let world = food.tile.world
      this.calories += food.size
      world.removeObj(food.key)
    } else {
      this.calories -= this.eatCost
    }
    return success
  }

  findFood () {
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

  kill () {
    let world = this.tile.world
    return world.removeObj(this.key)
  }

  //TODO rename to something like "tileHasHerb" and it should only need the tile
  plantHasCompetition (herb, plant) {
    // if herb is already on this plant, it doesn't count as competition
    if (this.onSameTile(herb, plant)) return false
    // otherwise we want to know if a plant is about to be eaten by a competing herb
    return plant.tile.objs.filter(o => o.name === 'herbivore').length > 0
  }

  comparePlants (herb, plant1, plant2) {
    // score is the chance to eat multiplied by the calories herb would get
    let score1 = this.chanceToEat(herb, plant1) / 100 * plant1.size
    let score2 = this.chanceToEat(herb, plant2) / 100 * plant2.size
    // add negative modifier if herb is not already on the plant
    if (!this.onSameTile(herb, plant1)) score1 -= this.movementCost
    if (!this.onSameTile(herb, plant2)) score2 -= this.movementCost
    // add negative modifier if plant has a competing herb on it
    if (this.plantHasCompetition(herb, plant1)) score1 -= .5
    if (this.plantHasCompetition(herb, plant2)) score2 -= .5
    return score1 > score2 ? plant1 : plant2
  }

  getBestFoodReducer (herb) {
    return (best, curr) => {
      if (!best) return curr
      return this.comparePlants(herb, curr, best)
    }
  }

  /**
   * Returns an integer size between 0 and 10
   */
  getDrawSize () {
    return Math.ceil(this.calories / this.gestation * 10)
  }

  //TODO give better name or have it return true/false
  onFood () {
    let tilePlants = this.tile.objs.filter(o => o.name === 'plant')
    if (tilePlants.length < 1) return false
    return tilePlants[0]
  }

  /**
   * If a tile is given, moves to that tile.
   * 
   * Otherwise, it moves to a random adjacent tile.
   */
  move (tile) {
    let world = this.tile.world
    this.calories -= this.movementCost
    if (tile) {
      return world.moveObj(this.key, tile.xloc, tile.yloc)
    }
    let neighborTiles = this.tile.world.getNeighbors(this.tile.xloc, this.tile.yloc)
    let index = Tools.getRand(0, neighborTiles.length - 1)
    let destinationTile = neighborTiles[index]
    return world.moveObj(this.key, destinationTile.xloc, destinationTile.yloc)
  }

  onSameTile (obj1, obj2) {
    if (!obj1 || !obj2) return false
    return obj1.tile === obj2.tile
  }

  // TODO do calorie check in this function and return success boolean
  propagate () {
    if (this.calories >= this.gestation) {
      let world = this.tile.world
      let neighborTiles = this.tile.world.getNeighbors(this.tile.xloc, this.tile.yloc)
      let index = Tools.getRand(0, neighborTiles.length - 1)
      let destinationTile = neighborTiles[index]
      let newColor = Tools.mutateColor(this.color, this.mutationFactor)

      // commented out below was used to mutate gestation
      // let newGestation = this.gestation + Tools.getRand(-1, 1)
      // if (newGestation < 2) newGestation = 2
      // let child = new Herbivore(newColor, Math.floor(this.gestation / 2), newGestation)

      let child = new Herbivore(newColor, Math.floor(this.gestation / 2))
      // console.log(`new child made with color ${newColor}, ${Math.floor(this.gestation / 2)} calories`)
      world.insertObj(child, destinationTile.xloc, destinationTile.yloc)
      this.calories -= Math.floor(this.gestation / 2)
      return true
    }
    return false
  }

  starved () {
    return this.calories <= 0
  }

  onTimeStep () {
    if (this.starved()) { return this.kill() }

    // look around for the best food for this herb
    let bestFood = this.findFood()
    let onBestFood = this.onSameTile(this, bestFood)
    if (onBestFood) { return this.eat() }
    if (this.propagate()) { return }
    if (bestFood) { return this.move(bestFood.tile) }
    // random move
    return this.move()
  }
}

console.log('Herbivore.js loaded')