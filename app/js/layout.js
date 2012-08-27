(function() {
  var _ref,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  if ((_ref = window.Inn) == null) {
    window.Inn = {};
  }

  Inn.Layout = Inn.View.extend({
    initialize: function(options) {
      if (!(options && options.dataManager && options.dataManager instanceof Inn.DataManager)) {
        throw new Inn.Error('dataManager should be in options');
      }
      this.options = $.extend(true, {}, Inn.Layout.defaults, options);
      this._dataManager = options.dataManager;
      this._views = [];
      this._viewsUnrendered = 0;
      this.id = this.options.id ? this.options.id : 'layout';
      return _.extend(this, Backbone.Events);
    },
    render: function() {
      var _this = this;
      if (this._renderDeferred && this._renderDeferred.state() === 'pending') {
        return this._renderDeferred;
      }
      this._renderDeferred = new $.Deferred();
      this._getTemplate().done(function() {
        var name, partial, _ref1, _results;
        $("#" + _this.id).html(_this._template());
        _this._processPartials();
        _this._parsePartials();
        _ref1 = _this.options.partials;
        _results = [];
        for (name in _ref1) {
          partial = _ref1[name];
          if (_this.getView(name)) {
            _results.push(_this.getView(name).render());
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      });
      return this._renderDeferred;
    },
    addView: function(view) {
      var data, viewInLayout;
      if (!(view instanceof Inn.View)) {
        throw new Inn.Error('view shold be an instance of Inn.View');
      }
      viewInLayout = _.find(this._views, function(existingView) {
        return existingView.id === view.id;
      });
      if (!(__indexOf.call(this._views, view) >= 0 || viewInLayout)) {
        this._views.push(view);
      }
      view.options.layout = this;
      if (!(view.model || view.collection)) {
        data = this._dataManager.getDataAsset(view.id);
        if (data) {
          if (data instanceof Inn.Model) {
            view.model = data;
          }
          if (data instanceof Inn.Collection) {
            view.collection = data;
          }
        } else {
          delete view.model;
          delete view.collection;
        }
      }
      view.on('render', _.bind(this._recheckSubViews, this, view));
      view.on('remove', _.bind(this._clearSubViews, this, view));
      view.on('remove', _.bind(this._onViewRemovedFromDOM, this, view));
      this.trigger('add:view', view);
      return this;
    },
    getView: function(name) {
      var _ref1;
      return (_ref1 = _.find(this._views, function(view) {
        return view.id === name;
      })) != null ? _ref1 : null;
    },
    removeView: function(name) {
      var survived;
      if ((survived = _.reject(this._views, function(view) {
        return view.id === name;
      })).length === this._views.length) {
        return null;
      }
      this._views = survived;
      return this.trigger('remove:view');
    },
    _processPartials: function(partials) {
      var name, partial, view;
      if (!partials) {
        partials = this.options.partials;
      }
      for (name in partials) {
        partial = partials[name];
        this.addView(new Inn.View({
          id: name
        }));
        view = this.getView(name);
        view.options._viewBranch = partial;
        if (partial.templateName) {
          view.options.templateName = partial.templateName;
        }
        if (partial.templateURL) {
          view.options.templateURL = partial.templateURL;
        }
        if (this.options && this.options.templateFolder) {
          view.options.templateFolder = this.options.templateFolder;
        }
        if (this.options && this.options.templateFormat) {
          view.options.templateFormat = this.options.templateFormat;
        }
        view.attributes = partial.attributes;
        if (partial.partials) {
          this._processPartials(partial.partials);
        }
      }
      return this;
    },
    _parsePartials: function(partialContent) {
      var element, idx, layout, name, partial, partialId, partialsObject, _i, _len, _ref1, _ref2, _results;
      layout = this;
      if (!partialContent) {
        partialContent = $("#" + this.id);
      }
      partialId = partialContent.attr('id');
      partialsObject = {
        partials: {}
      };
      _ref1 = $(partialContent).children("." + this.options.placeholderClassName);
      for (idx = _i = 0, _len = _ref1.length; _i < _len; idx = ++_i) {
        element = _ref1[idx];
        partialsObject.partials[$(element).attr('id')] = {};
      }
      if (this.options.partials == null) {
        this._processPartials(partialsObject.partials);
        if (this.getView(partialId)) {
          this.getView(partialId).options._viewBranch = partialsObject;
        }
        _ref2 = partialsObject.partials;
        _results = [];
        for (name in _ref2) {
          partial = _ref2[name];
          if (this.getView(name)) {
            _results.push(this.getView(name).render());
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      }
    },
    _recheckSubViews: function(view) {
      var name, partial, _ref1;
      this._viewsUnrendered--;
      if (view.el.parentNode === null && $("#" + view.id).length) {
        $("#" + view.id).replaceWith(view.$el);
        view.options.isInDOM = true;
      }
      if (!view.options._viewBranch.partials) {
        this._parsePartials(view.$el);
      }
      if (view.options._viewBranch.partials) {
        _ref1 = view.options._viewBranch.partials;
        for (name in _ref1) {
          partial = _ref1[name];
          this.getView(name).render();
        }
      }
      if (this._viewsUnrendered <= 0) {
        this._renderDeferred.resolve();
      }
      return this;
    },
    _clearSubViews: function(view) {
      var name, partial, _ref1, _results;
      if (this._destroyDeferred) {
        this._destroyDeferred.notify();
      }
      if (view.options._viewBranch.partials) {
        _ref1 = view.options._viewBranch.partials;
        _results = [];
        for (name in _ref1) {
          partial = _ref1[name];
          if (this.getView(name)) {
            _results.push(this.getView(name).remove());
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      }
    },
    _onViewRemovedFromDOM: function(view) {},
    destroy: function() {
      var layout, name, partial, _ref1,
        _this = this;
      $("#" + this.id).empty();
      layout = this;
      this._destroyDeferred = new $.Deferred();
      this._destroyDeferred.progress(function() {
        var viewsInDOM;
        viewsInDOM = _.filter(layout._views, function(view) {
          return view.options.isInDOM;
        });
        if (viewsInDOM.length === 0) {
          return this.resolve();
        }
      });
      this._destroyDeferred.done(function() {
        var view, _i, _len, _ref1, _results;
        _ref1 = layout._views;
        _results = [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          view = _ref1[_i];
          _results.push(_this.removeView(view.id));
        }
        return _results;
      });
      _ref1 = this.options.partials;
      for (name in _ref1) {
        partial = _ref1[name];
        if (this.getView(name)) {
          this.getView(name).remove();
        }
      }
      return this._destroyDeferred;
    }
  });

  Inn.Layout.defaults = {
    placeholderClassName: 'layoutPlaceholder',
    templateFolder: '',
    templateFormat: 'js'
  };

}).call(this);
