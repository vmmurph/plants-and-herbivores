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
      let newColor = Tools.mutateColor(this.color, 75)
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

console.log('Plant.js loaded')