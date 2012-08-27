window.Inn ?= {}

#### *class* Inn.Collection
#
#---
# Класс коллекции
# 
Inn.Collection = Backbone.Collection.extend({

  ##### url()
  #
  #---
  # Возвращает URL, по которому доступна коллекция
  url: -> 
    return '#'

  ##### model
  # 
  #---
  # Модель коллекции
  model: Inn.Model
  
})