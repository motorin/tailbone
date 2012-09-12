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
  var _ref,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  if ((_ref = window.Inn) == null) {
    window.Inn = {};
  }

  Inn.ViewsCollection = (function() {

    function ViewsCollection() {
      this._list = [];
    }

    ViewsCollection.prototype.add = function(view) {
      if (__indexOf.call(this._list, view) < 0) {
        this._list.push(view);
        view.on('destroy', this.viewDestroyHandler);
      }
      return this;
    };

    ViewsCollection.prototype.render = function() {
      var view, _i, _len, _ref1;
      _ref1 = this._list;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        view = _ref1[_i];
        view.on('ready', this.viewReadyHandler, this);
        view.render();
      }
      return this;
    };

    ViewsCollection.prototype.stopRender = function() {
      var view, _i, _len, _ref1;
      _ref1 = this._list;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        view = _ref1[_i];
        view.off('ready');
        view.stopRender();
      }
      return this;
    };

    ViewsCollection.prototype.viewDestroyHandler = function(view) {
      return this.trigger('destroy', view);
    };

    ViewsCollection.prototype.viewReadyHandler = function() {
      if (this.isRendered()) {
        this.trigger('ready');
        this.off('ready');
      }
      return this;
    };

    ViewsCollection.prototype.isRendered = function() {
      return _.filter(this._list, function(view) {
        return !view.ready;
      }).length === 0;
    };

    ViewsCollection.prototype.get = function(id, recursive) {
      if (recursive == null) {
        recursive = false;
      }
      return _.find(this._list, function(view) {
        return view.id === id;
      });
    };

    ViewsCollection.prototype.reset = function() {
      var view, _i, _len, _ref1;
      _ref1 = this._list;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        view = _ref1[_i];
        view.ready = false;
      }
      return this;
    };

    ViewsCollection.prototype.destroy = function() {
      var view, _i, _len, _ref1;
      _ref1 = this._list;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        view = _ref1[_i];
        view.destroy();
      }
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
      var _ref1, _ref2;
      this.partials = partials != null ? partials : null;
      this.partials = (_ref1 = (_ref2 = this.partials) != null ? _ref2 : this.options.partials) != null ? _ref1 : [];
      this.children = new Inn.ViewsCollection;
      this._parent = null;
      this.ready = false;
      return this._rendering = false;
    },
    destroy: function() {
      this.parent = null;
      this.remove();
      this.children.destroy();
      this.trigger('destroy', this);
      return this;
    },
    render: function() {
      var _this = this;
      if (this._rendering) {
        this.stopRender();
      }
      this._rendering = true;
      if (this.$el.data('view-template') != null) {
        this.options.templateName = this.$el.data('view-template');
      }
      this._loadTemplate(function(template) {
        var $ctx, child, idx, partial, patchedOptions, view, _i, _j, _len, _len1, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6;
        _this.$el.html(template((_ref1 = (_ref2 = (_ref3 = _this.options.model) != null ? _ref3.toJSON() : void 0) != null ? _ref2 : (_ref4 = _this.options.dataManager) != null ? _ref4.getDataAsset() : void 0) != null ? _ref1 : {}));
        patchedOptions = _.clone(_this.options);
        patchedOptions.partials = [];
        _ref5 = _this.partials;
        for (idx = _i = 0, _len = _ref5.length; _i < _len; idx = ++_i) {
          partial = _ref5[idx];
          $ctx = _this.$el.find("#" + partial.id);
          if (partial instanceof Inn.View) {
            view = partial;
            view.options = _.extend({}, patchedOptions, view.options);
            view.setElement($ctx.get(0));
          } else {
            view = new Inn.View(_.extend({}, patchedOptions, {
              el: $ctx.get(0)
            }, partial));
          }
          view._parent = _this;
          _this.children.add(view);
        }
        _ref6 = _this.pullChildren();
        for (idx = _j = 0, _len1 = _ref6.length; _j < _len1; idx = ++_j) {
          child = _ref6[idx];
          _this.initPartial(child, patchedOptions, false);
        }
        if (_this.children.isEmpty()) {
          if (!_this.isRoot()) {
            _this.ready = true;
          }
          _this._rendering = false;
          _this.trigger('ready');
        } else {
          _this.children.on('ready', _this._readyHandler, _this);
        }
        return _this.children.render();
      });
      return this;
    },
    initPartial: function(el, config, silent) {
      var $ctx, view;
      if (config == null) {
        config = {};
      }
      if (silent == null) {
        silent = false;
      }
      $ctx = $(el);
      $ctx.removeClass(this.options.partialClassName);
      view = new Inn.View(_.extend({}, config, {
        el: $ctx.get(0),
        id: $ctx.attr('id')
      }, $ctx.data('view-options')));
      view._parent = this;
      if (!silent) {
        return this.children.add(view);
      }
    },
    _readyHandler: function() {
      if (!this.isRoot()) {
        this.ready = true;
      }
      this.children.reset();
      this._rendering = false;
      return this.trigger('ready');
    },
    stopRender: function() {
      this._rendering = false;
      this.off('ready', this._readyHandler, this);
      this.children.stopRender();
      return this;
    },
    _loadTemplate: function(callback) {
      var template,
        _this = this;
      template = function() {
        try {
          return jade.templates[_this._getTemplateName()];
        } catch (e) {
          return '';
        }
      };
      if (jade.templates[this._getTemplateName()] != null) {
        setTimeout(function() {
          return callback.call(this, template);
        });
      } else {
        $.getScript(this._getTemplateURL(), function() {
          return callback.call(this, template);
        });
      }
      return this;
    },
    _getTemplateURL: function() {
      var divider;
      divider = this.options.templateFolder ? '/' : '';
      if (this.options.templateURL == null) {
        return this.options.templateFolder + divider + this._getTemplateName() + '.' + this.options.templateFormat;
      }
      return this.options.templateURL;
    },
    _getTemplateName: function() {
      if (!this.options.templateName) {
        return 'b' + this.id[0].toUpperCase() + this.id.slice(1);
      }
      return this.options.templateName;
    },
    pullChildren: function() {
      return this.$el.find("." + this.options.partialClassName);
    },
    isRoot: function() {
      return this._parent === null;
    },
    options: {
      partialClassName: 'bPartial',
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
