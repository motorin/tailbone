/*
   app-dust-backbone - v0.0.0
*/

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

(function() {
  var _ref;

  if ((_ref = window.Inn) == null) {
    window.Inn = {};
  }

  Inn.View = Backbone.View.extend({
    initialize: function(options, partials) {
      this.partials = partials != null ? partials : [];
      return this._load();
    },
    destroy: function() {
      this.parent = null;
      return this;
    },
    render: function() {
      var child, idx, partial, _i, _j, _len, _len1, _ref1, _ref2,
        _this = this;
      _ref1 = this.partials;
      for (idx = _i = 0, _len = _ref1.length; _i < _len; idx = ++_i) {
        partial = _ref1[idx];
        this.children.add(partial);
      }
      _ref2 = this.pullChildren();
      for (idx = _j = 0, _len1 = _ref2.length; _j < _len1; idx = ++_j) {
        child = _ref2[idx];
        this.children.add(child);
      }
      if (this.children.isEmpty()) {
        setTimeout(function() {
          _this.ready = true;
          return _this.trigger('ready');
        });
      } else {
        this.children.on('ready', function() {
          return _this.trigger('ready');
        });
      }
      return this;
    },
    _load: function() {
      var _this = this;
      setTimeout(function() {
        return _this.trigger('loaded');
      });
      return this;
    },
    pullChildren: function() {
      return [];
    },
    isRoot: function() {
      return this._parent === null;
    },
    ready: false,
    _parent: null,
    children: new Inn.ViewsCollection,
    options: {
      placeholderClassName: 'layoutPlaceholder',
      templateFolder: '',
      templateFormat: 'js'
    }
  });

}).call(this);

(function() {
  var _ref;

  if ((_ref = window.Inn) == null) {
    window.Inn = {};
  }

  Inn.DataManager = (function() {

    function DataManager() {
      this._dataSets = [];
      _.extend(this, Backbone.Events);
    }

    DataManager.prototype.addDataAsset = function(dataAsset, id) {
      if (!(dataAsset instanceof Inn.Model || dataAsset instanceof Inn.Collection)) {
        throw new Inn.Error('dataAsset shold be an instance of Inn.Model or Inn.Collection');
      }
      if (!(dataAsset.id || id)) {
        throw new Inn.Error('dataAsset id is required');
      }
      if (id) {
        dataAsset.id = id;
      }
      if (_.indexOf(this._dataSets, dataAsset) === -1) {
        this._dataSets.push(dataAsset);
      }
      this.trigger('add:dataAsset', dataAsset);
      return this;
    };

    DataManager.prototype.getDataAsset = function(name) {
      var found;
      found = _.find(this._dataSets, function(dataSet) {
        return dataSet.id === name;
      });
      if (found != null) {
        return found;
      }
      return null;
    };

    DataManager.prototype.removeDataAsset = function(name) {
      var survived;
      survived = _.reject(this._dataSets, function(dataSet) {
        return dataSet.id === name;
      });
      if (this._dataSets.length === survived.length) {
        return null;
      }
      this._dataSets = survived;
      return this.trigger('remove:dataAsset');
    };

    DataManager.prototype.destroy = function() {
      var dataManager;
      dataManager = this;
      return _.each(this._dataSets, function(dataAsset) {
        return dataManager.removeDataAsset(dataAsset.id);
      });
    };

    return DataManager;

  })();

}).call(this);
