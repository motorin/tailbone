(function() {
  var _ref;

  if ((_ref = window.Inn) == null) {
    window.Inn = {};
  }

  Inn.ViewsCollection = (function() {

    function ViewsCollection() {
      this._list = [];
    }

    ViewsCollection.prototype.add = function(view) {
      this._list.push(view);
      return this;
    };

    ViewsCollection.prototype.render = function() {
      var view, _i, _len, _ref1, _results,
        _this = this;
      _ref1 = this._list;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        view = _ref1[_i];
        view.on('ready', function() {
          if (_this.isRendered()) {
            return _this.trigger('ready');
          }
        });
        _results.push(view.render());
      }
      return _results;
    };

    ViewsCollection.prototype.isRendered = function() {
      return _.filter(this._list, function(view) {
        return !view.ready;
      }).length === 0;
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
