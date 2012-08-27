(function() {
  var _ref;

  if ((_ref = window.Inn) == null) {
    window.Inn = {};
  }

  Inn.Model = Backbone.Model.extend({
    url: function() {
      return "app/models/" + this.id + ".json";
    }
  });

}).call(this);
