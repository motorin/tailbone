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
      this.children.destroy();
      this.trigger('destroyed', this);
      return this;
    },
    render: function(skipChildren, replaceContext) {
      var _this = this;
      if (skipChildren == null) {
        skipChildren = false;
      }
      if (replaceContext == null) {
        replaceContext = true;
      }
      if (this._rendering) {
        this.stopRender();
      }
      this._rendering = true;
      if (this.$el.data('view-template') != null) {
        this.options.templateName = this.$el.data('view-template');
      }
      this._loadTemplate(function(template) {
        var _ref1;
        return require((_ref1 = _this.options.i18nRequire) != null ? _ref1 : [], function() {
          var $ctx, child, foundPartial, idx, partial, patchedOptions, view, _i, _j, _len, _len1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8;
          _this._$memorizedEl = _this.$el;
          _this.$el = _this.$el.clone(true, true);
          _this.el = _this.$el.get();
          _this.$el.html(template((_ref2 = (_ref3 = (_ref4 = _this.options.model) != null ? _ref4.toJSON() : void 0) != null ? _ref3 : (_ref5 = _this.options.dataManager) != null ? _ref5.getDataAsset() : void 0) != null ? _ref2 : {}));
          patchedOptions = _.clone(_this.options);
          patchedOptions.partials = [];
          _ref6 = _this.partials;
          for (idx = _i = 0, _len = _ref6.length; _i < _len; idx = ++_i) {
            partial = _ref6[idx];
            foundPartial = _this.children.get((_ref7 = partial.id) != null ? _ref7 : partial.cid);
            $ctx = _this.$el.find("#" + partial.id);
            if (foundPartial != null) {
              foundPartial.setElement($ctx);
            } else {
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
          }
          _ref8 = _this.pullChildren();
          for (idx = _j = 0, _len1 = _ref8.length; _j < _len1; idx = ++_j) {
            child = _ref8[idx];
            _this.initPartial(child, patchedOptions, false);
          }
          if (skipChildren || _this.children.isEmpty()) {
            if (!_this.isRoot()) {
              _this.ready = true;
            }
            _this._rendering = false;
            if (replaceContext) {
              _this.replaceContext();
            } else {
              _this.trigger('readyForReplacement', _this);
            }
            return _this.trigger('ready');
          } else {
            _this.children.on('ready', _.bind(_this._readyHandler, _this, replaceContext));
            return _this.children.render();
          }
        });
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
        this.children.add(view);
      }
      return view;
    },
    replaceContext: function() {
      this._$memorizedEl.replaceWith(this.$el);
      return this._$memorizedEl = void 0;
    },
    _readyHandler: function(replaceContext) {
      if (!this.isRoot()) {
        this.ready = true;
      }
      this.children.reset();
      this._rendering = false;
      if (replaceContext) {
        this.replaceContext();
      } else {
        this.trigger('readyForReplacement', this);
      }
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
          return jade.templates[_this._getTemplateName()].apply(null, arguments);
        } catch (e) {
          if (typeof window.console !== 'undefined' && typeof window.console.debug === 'function') {
            console.debug("tailbone view error [" + (_this._getTemplateName()) + "]:", e.toString());
          }
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
    reInitPartial: function(view) {
      var options;
      options = view.options;
      this.children.remove(view);
      this.children.add(this.initPartial(view.$el, options).render());
      return view.destroy();
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
