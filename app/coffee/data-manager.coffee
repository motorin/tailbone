###
Is Inn namespace defined?
###
window.Inn ?= {}

###
Data Manager
###
class Inn.DataManager
  constructor: () ->    
    @_dataSets = []
    
    _.extend(this, Backbone.Events)
    
  
  addDataAsset: (dataAsset, id) ->
    
    throw new Inn.Error('dataAsset shold be an instance of Inn.Model or Inn.Collection') unless dataAsset instanceof Inn.Model or dataAsset instanceof Inn.Collection
    throw new Inn.Error('dataAsset id is required') unless dataAsset.id or id
    
    dataAsset.id = id if id

    #do not add same data twice
    @_dataSets.push(dataAsset) if _.indexOf(@_dataSets, dataAsset) == -1
    
    @trigger('add:dataAsset', dataAsset);
    
    return this
  
  
  getDataAsset: (name) ->
    
    found = _.find @_dataSets, (dataSet) ->
      return dataSet.id == name
    
    return found if found?
    
    return null
    
    
  removeDataAsset: (name) ->
    
    survived = _.reject @_dataSets, (dataSet) ->
      return dataSet.id == name
    
    return null if @_dataSets.length == survived.length
    
    @_dataSets = survived
    
    @trigger('remove:dataAsset')

  destroy: ->
    dataManager = this
    
    _.each @_dataSets, (dataAsset)->
      dataManager.removeDataAsset dataAsset.id
    
