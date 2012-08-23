
/*
Is Inn namespace defined?
*/


(function() {
  var _ref;

  if ((_ref = window.Inn) == null) {
    window.Inn = {};
  }

  /*
  Application Model
  */


  Inn.Model = Backbone.Model.extend({
    url: function() {
      return 'app/models/' + this.id + '.json';
    }
  });

}).call(this);
