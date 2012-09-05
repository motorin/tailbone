(function() {
  var _ref;

  if ((_ref = window.Inn) == null) {
    window.Inn = {};
  }

  Inn.ViewsCollection = (function() {

    function ViewsCollection() {}

    ViewsCollection.prototype._list = _([]);

    ViewsCollection.prototype.add = function(view) {
      var _this = this;
      this._list.push(view);
      view.on('ready', function() {
        if (!_this._list.filter(function(view) {
          return !view.ready;
        }).length) {
          return _this.trigger('ready');
        }
      });
      view.render();
      return this;
    };

    ViewsCollection.prototype.remove = function(view) {
      view.destroy();
      return this;
    };

    ViewsCollection.prototype.isEmpty = function() {
      return !this._list.length;
    };

    _.extend(ViewsCollection.prototype, Backbone.Events);

    return ViewsCollection;

  })();

}).call(this);
