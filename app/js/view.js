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
    isValid: function() {
      return true;
    },
    options: {
      placeholderClassName: 'layoutPlaceholder',
      templateFolder: '',
      templateFormat: 'js'
    }
  });

}).call(this);
