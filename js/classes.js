class Cat {
  constructor(id, name, clickCount, imageName) {
    /* id can be an optional dictionary used
     * to populate properites
     */

    // properties
    var catID
    var catName
    var catClickCount
    var catImageName

    if (typeof(id) === "number") {
      catID = id
      catName = name
      catClickCount = clickCount
      catImageName = `${imageName}`
    } else {
      const content = id
      catID = content['id']
      catName = content['name']
      catClickCount = content['clickCount']
      catImageName = content['imageName']
    }

    // getters
    this.getID = function() {
      return catID
    }
    this.getName = function() {
      return catName
    }
    this.getClickCount = function() {
      return catClickCount
    }
    this.getImageName = function() {
      return catImageName
    }

    // setters
    this.setName = function(name = catName) {
      catName = name
    }
    this.setClickCount = function(count = catClickCount) {
      catClickCount = count
      return catClickCount
    }
    this.setImageName = function(imageName = catImageName) {
      catImageName = imageName
    }

    // methods
    this.serialize = function() {
      return {
        id : this.getID(),
        name : this.getName(),
        imageName : this.getImageName(),
        clickCount : this.getClickCount()
      }
    }
  }
}

class Sequence {
  constructor(current = 0) {
    var currentIteration = current
    this.up = function() {
      currentIteration += 1
    }
    this.get = function(shouldUp) {
      if (shouldUp) {
        this.up()
        return (currentIteration - 1)
      } else {
        return currentIteration
      }
    }
  }
}

class View {
  constructor(content) {
    this.props = {}
    var state = {}
    // required properties
    var reqProps = {
      init: false,
      render: false
    }

    // check for required props and
    // set any extra props
    for (let prop in content) {
      if (content.hasOwnProperty(prop))  {
        if (reqProps[prop] != null) {
          reqProps[prop] = true
        }
        eval(`this.${prop} = content.${prop}`)
      }
    }
    for (let key in reqProps) {
      if (reqProps[key] == false) {
        console.error(`Missing required property ${key} for View.`)
      }
    }

    // methods
    this.getState = function() {
      return state
    }

    this.setState = function(stateObject) {
      state = Object.assign(state, stateObject)
      if (this.onChange != undefined) {
        this.onChange()
      }

      return state
    }
  }
}
