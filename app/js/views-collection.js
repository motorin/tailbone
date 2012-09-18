(function() {
  var _ref,
    __hasProp = {}.hasOwnProperty;

  if ((_ref = window.Inn) == null) {
    window.Inn = {};
  }

  Inn.ViewsCollection = (function() {

    function ViewsCollection() {
      this._list = {};
    }

    ViewsCollection.prototype.add = function(view) {
      var _ref1, _ref2;
      if (this._list[(_ref1 = view.id) != null ? _ref1 : view.cid] == null) {
        this._list[(_ref2 = view.id) != null ? _ref2 : view.cid] = view;
      }
      return this;
    };

    ViewsCollection.prototype.remove = function(view) {
      var _ref1;
      this._list[(_ref1 = view.id) != null ? _ref1 : view.cid] = void 0;
      return this;
    };

    ViewsCollection.prototype.render = function() {
      var idx, view, _ref1;
      _ref1 = this._list;
      for (idx in _ref1) {
        if (!__hasProp.call(_ref1, idx)) continue;
        view = _ref1[idx];
        view.on('ready', this.viewReadyHandler, this);
        view.render();
      }
      return this;
    };

    ViewsCollection.prototype.stopRender = function() {
      var idx, view, _ref1;
      _ref1 = this._list;
      for (idx in _ref1) {
        if (!__hasProp.call(_ref1, idx)) continue;
        view = _ref1[idx];
        view.off('ready');
        view.stopRender();
      }
      return this;
    };

    ViewsCollection.prototype.viewReadyHandler = function() {
      if (this.isRendered()) {
        this.trigger('ready');
        this.off('ready');
      }
      return this;
    };

    ViewsCollection.prototype.isRendered = function() {
      var idx, view, _ref1;
      _ref1 = this._list;
      for (idx in _ref1) {
        if (!__hasProp.call(_ref1, idx)) continue;
        view = _ref1[idx];
        if (!view.ready) {
          return false;
        }
      }
      return true;
    };

    ViewsCollection.prototype.get = function(id, recursive) {
      if (recursive == null) {
        recursive = false;
      }
      return this._list[id];
    };

    ViewsCollection.prototype.reset = function() {
      var idx, view, _ref1;
      _ref1 = this._list;
      for (idx in _ref1) {
        if (!__hasProp.call(_ref1, idx)) continue;
        view = _ref1[idx];
        view.ready = false;
      }
      return this;
    };

    ViewsCollection.prototype.destroy = function() {
      var idx, view, _ref1;
      _ref1 = this._list;
      for (idx in _ref1) {
        view = _ref1[idx];
        view.destroy();
      }
      this._list = {};
      return this;
    };

    ViewsCollection.prototype.isEmpty = function() {
      var idx, _ref1;
      _ref1 = this._list;
      for (idx in _ref1) {
        if (!__hasProp.call(_ref1, idx)) continue;
        return false;
      }
      return true;
    };

    _.extend(ViewsCollection.prototype, Backbone.Events);

    return ViewsCollection;

  })();

}).call(this);
