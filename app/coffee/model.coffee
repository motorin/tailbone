###
Is Inn namespace defined?
###
window.Inn ?= {}

###
Application Model
###
Inn.Model = Backbone.Model.extend({
  url: ->
    return 'app/models/'+@id+'.json'
});