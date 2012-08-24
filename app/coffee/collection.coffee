###
Is Inn namespace defined?
###
window.Inn ?= {}

###
Application Collection
###
Inn.Collection = Backbone.Collection.extend({
  url: ->
    return '#'
  model: Inn.Model
});