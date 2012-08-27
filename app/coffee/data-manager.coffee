window.Inn ?= {}

#### *class* Inn.DataManager
#
#---
# Менеджер данных
# 
class Inn.DataManager

  ##### constructor()
  #
  #---
  # Создаёт экземпляр менеджера данных
  constructor: () ->    
    @_dataSets = []
    # Умееть генерировать события (Backbone.Events)
    _.extend(this, Backbone.Events)
    
  ##### addDataAsset( *dataAsset*, *id* )
  #
  #---
  # Принимает и добавляет набор данных ввиде экземпляра Inn.Model или Inn.Collection
  addDataAsset: (dataAsset, id) ->
    
    throw new Inn.Error('dataAsset shold be an instance of Inn.Model or Inn.Collection') unless dataAsset instanceof Inn.Model or dataAsset instanceof Inn.Collection
    throw new Inn.Error('dataAsset id is required') unless dataAsset.id or id
    
    dataAsset.id = id if id

    @_dataSets.push(dataAsset) if _.indexOf(@_dataSets, dataAsset) == -1 # do not add same data twice
    # Генерирует событие **"add:dataAsset"**
    @trigger('add:dataAsset', dataAsset);
    
    return this
  
  ##### getDataAsset( *name* )
  #
  #---
  # Достаёт набор данных по имени
  getDataAsset: (name) ->
    
    found = _.find @_dataSets, (dataSet) ->
      return dataSet.id == name
    
    return found if found?
    
    return null
    
  ##### removeDataAsset( *name* )
  #
  #---
  # Удаляет набор данных по имени
  removeDataAsset: (name) ->
    
    survived = _.reject @_dataSets, (dataSet) ->
      return dataSet.id == name
    
    return null if @_dataSets.length == survived.length
    
    @_dataSets = survived
    
    @trigger('remove:dataAsset')

  ##### destroy()
  #
  #---
  # Уничтожает все наборы данных
  destroy: ->
    dataManager = this
    
    _.each @_dataSets, (dataAsset)->
      dataManager.removeDataAsset dataAsset.id
    
