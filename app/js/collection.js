(function() {
  var _ref;

  if ((_ref = window.Inn) == null) {
    window.Inn = {};
  }

  Inn.Collection = Backbone.Collection.extend({
    url: function() {
      return '#';
    },
    model: Inn.Model
  });

}).call(this);
