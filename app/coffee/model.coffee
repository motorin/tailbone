window.Inn ?= {}

#### *class* Inn.model
#
#---
# Класс модели
# 
Inn.Model = Backbone.Model.extend({
  ##### url()
  #
  #---
  # Возвращает URL, по которому доступна модель
  url: -> "app/models/#{@id}.json"
  
})