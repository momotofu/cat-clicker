(function() {

/**
 * model
 */

const model = {
  init: function() {
    if (!localStorage.model) {
      // populate model with initial data
      seq = new Sequence()
      cats = {}

      cats[seq.get()] = new Cat(seq.get(true), 'cat', 2, 'img/cat.jpeg').serialize(),
        cats[seq.get()] = new Cat(seq.get(true), 'lazy', 0, 'img/lazy.jpeg').serialize(),
        cats[seq.get()] = new Cat(seq.get(true), 'zelda', 0, 'img/zelda.jpeg').serialize(),
        cats[seq.get()] = new Cat(seq.get(true), 'paws', 0, 'img/paws.jpeg').serialize(),
        cats[seq.get()] = new Cat(seq.get(true), 'jumply', 0, 'img/jumply.jpeg').serialize(),
      cats['nextsequence'] = seq.get()

      localStorage.model = JSON.stringify({'cat': cats })
    }
  },

  getAllObjectsOf: function(objectName) {
    return JSON.parse(localStorage.model)[objectName]
  },

  getOneObjectOf: function(objectName, id) {
    return JSON.parse(localStorage.model)[objectName][id]
  },

  updateOneObject: function(object) {
    const storage = JSON.parse(localStorage.model)
    const modelName = object.constructor.name.toLowerCase()
    const modelID = object.getID()

    if (storage[modelName][modelID] != undefined) {
      storage[modelName][modelID] = object.serialize()
      localStorage.model = JSON.stringify(storage)
    } else {
      console.error(`No model with id of ${modelID}`)
    }
  }
}

/**
 * controller
 */

const controller = {
  init: function() {
    this.views = {
      'listView': listView,
      'mainView': mainView,
      'adminPanelView' : adminPanelView
    }

    model.init()
    mainView.init()
    listView.init()
    adminPanelView.init()
  },

  getAllObjectsOf: function(objectName) {
    // returns an array of cat objects
    objectDict = model.getAllObjectsOf(objectName)
    objects = []

    for (let key in objectDict) {
      if (!isNaN(parseInt(key))) {
        objects.push(new Cat(objectDict[key]))
      }
    }
    return objects
  },

  getOneObjectOf: function(objectName, id) {
    return new Cat(model.getOneObjectOf(objectName, id))
  },

  updateOneObject: function(object) {
    model.updateOneObject(object)
  },

  renderView: function(viewName, data) {
    const view = this.views[viewName]
    if (data != undefined) {
      view.props.data = data
    }
    view.render()
  }
}

/**
 * views
 */

const mainView = new View({
  init: function() {
    this.figure = document.getElementsByClassName('hero-container')[0]
    this.props.data = controller.getAllObjectsOf('cat')[0]
    this.render()

    // add event listener
    const cat = this.props.data
    this.figure.onclick = this.clickEvent.bind(event, cat.getID(), this)
  },

  clickEvent: function(id, context, event) {
    event.preventDefault()

    const cat = context.props.data
    const clickCount = cat.setClickCount(cat.getClickCount() + 1)
    controller.updateOneObject(cat)

    const clickCounter = document.getElementById('number-of-clicks')
    clickCounter.innerText = clickCount
  },

  render: function() {
    const cat = this.props.data

    this.figure.innerHTML = `
      <img class="hero-image" src="${cat.getImageName()}" alt="a cute and fury kitten">
      <figcaption>
        <p class="text-left mt-1">
          the total number if clicks is <span class="number-of-clicks" id="number-of-clicks">${cat.getClickCount()}</span>
        </p>
      </figcaption>
    `
  }
})

const listView = new View({
  init: function() {
    this.catList = document.getElementById('cat-list')
    this.render()
  },

  bindEventListeners: function() {
    const children = this.catList.children
    for (let key in children) {
      if (!isNaN(key)) {
        child = children[key]
        child.onclick = this.clickEvent.bind(event, this)
      }
    }
  },

  onChange: function() {
    const children = this.catList.children
    const selectedID = this.getState().selectedID
    const selectedClassName = 'cat-list__item--active'

    for (let key in children) {
      if (!isNaN(key)) {
        const child = children[key]

        // update elements with the correct class
        if (child.getAttribute('data-id') != selectedID) {
          child.classList.remove(selectedClassName)
        } else {
          child.classList.add(selectedClassName)
        }
      }
    }
  },

  clickEvent: function(context, event) {
    event.preventDefault()
    const dataID = event.target.getAttribute('data-id')

    context.setState({
      selectedID : dataID
    })

    const cat = controller.getOneObjectOf('cat', dataID)
    controller.renderView('mainView', cat)
    controller.renderView('adminPanelView', cat)
  },

  render: function() {
    // update DOM with any new data changes
    const selectedID = this.getState().selectedID
    var HTMLString = ''

    controller.getAllObjectsOf('cat').forEach(function(object) {
        HTMLString += `
          <li class="list-group-item cat-list__item ${selectedID == object.getID() ? 'cat-list__item--active' : ''}" data-id="${object.getID()}">
            ${object.getName()}
          </li>
        `
    })

    this.catList.innerHTML = HTMLString
    this.bindEventListeners()
  }
})

const adminPanelView = new View({
  init: function() {
    this.setState({
      isClosed : true,
      percentOpen : 0,
      intervalID : 0
    })

    this.props.data = controller.getAllObjectsOf('cat')[0]
    this.controlsContainer = document.getElementsByClassName('admin__controls')[0]
    this.adminButton = document.getElementById('adminButton')
    this.adminPanel = document.getElementsByClassName('admin__panel')[0]
    this.nameInput = document.getElementById('nameInput')
    this.resetClicksInput = document.getElementById('resetClicksInput')
    this.imageNameInput = document.getElementById('imageNameInput')
    this.cancelBtn = document.getElementById('cancelBtn')
    this.saveBtn = document.getElementById('saveBtn')
    this.render()



    // add event listeners
    this.adminButton.onclick = this.animateAdminPanel.bind(event, this)
    this.saveBtn.onclick = this.saveData.bind(event, this)
    this.cancelBtn.onclick = this.cancelControls.bind(event, this)
  },

  animateAdminPanel: function(context, event) {
    const isClosed = context.getState().isClosed
    context.setState({
      isClosed: !isClosed
    })

    if (isClosed) {
      clearInterval(context.getState().intervalID)
      context.setState({
        intervalID: setInterval(movePanel.bind(event, true, context), 10)
      })

      context.adminButton.innerText = "HIDE ADMIN"

    } else {
      clearInterval(context.getState().intervalID)
      context.setState({
        intervalID: setInterval(movePanel.bind(event, false, context), 10)
      })

      context.adminButton.innerText = "SHOW ADMIN"
    }

    function movePanel(isPos, context) {
      var percentOpen = context.getState().percentOpen
      if (percentOpen >= 100 && isPos) {
        context.setState({
          percentOpen: 100
        })

        clearInterval(context.getState().intervalID)
        context.adminPanel.setAttribute('style', `transform: translateY(${percentOpen}%)`)
        return

      } else if (percentOpen <= 0 && !isPos) {
        context.setState({
          percentClosed: 0
        })

        clearInterval(context.getState().intervalID)
        context.adminPanel.setAttribute('style', `transform: translateY(${percentOpen}%)`)
        return

      }

      context.adminPanel.setAttribute('style', `transform: translateY(${percentOpen}%)`)
      const variable = Math.round(percentOpen > 5 ? percentOpen * 0.13: 1)

      context.setState({
        percentOpen: percentOpen + (isPos ? 1 : -1) * variable
      })
    }
  },

  saveData: function(context, event) {
    event.preventDefault()
    context.animateAdminPanel(context, event)

    const catName = context.nameInput.value
    const catImageName = context.imageNameInput.value
    const resetClicks = context.resetClicksInput.checked
    const cat = context.props.data

    catName != '' ? cat.setName(catName) : ''
    catImageName != '' ? cat.setImageName(catImageName) : ''
    resetClicks ? cat.setClickCount(0) : ''

    controller.updateOneObject(cat)
    controller.renderView('listView')
    controller.renderView('mainView')
    context.render()
  },

  cancelControls: function(context, event) {
    event.preventDefault()
    context.animateAdminPanel(context, event)
    context.render()
  },

  render: function() {
    const cat = this.props.data

    this.nameInput.setAttribute('placeholder', cat.getName())
    this.imageNameInput.setAttribute('placeholder', cat.getImageName())

    this.nameInput.value = ""
    this.imageNameInput.value = ""
    this.resetClicksInput.checked = false
  }
})

controller.init()
})()
