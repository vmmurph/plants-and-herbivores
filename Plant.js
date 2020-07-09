class Plant {
  name = 'plant'
  size = 1
  doneGrowing = false
  mutationFactor = 10

  constructor (color = 0) {
    this.color = color
  }

  asText () { return 'P' + this.size }

  grow () {
    if (this.size < 5 && Tools.roll(50)) {
      this.size++
    }
  }

  onTimeStep () {
    this.propagate()
    this.grow()
  }

  propagate () {
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
      let newColor = Tools.mutateColor(this.color, this.mutationFactor)
      this.tile.world.insertObj(new Plant(newColor), chosenTile.xloc, chosenTile.yloc)
    }
  }
}

console.log('Plant.js loaded')