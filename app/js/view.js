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
          $ctx = $(child);
          $ctx.removeClass(_this.options.partialClassName);
          view = new Inn.View(_.extend({}, patchedOptions, {
            el: $ctx.get(0),
            id: $ctx.attr('id')
          }, $ctx.data('view-options')));
          view._parent = _this;
          if ($ctx.data('view-template') != null) {
            view.options.templateName = $ctx.data('view-template');
          }
          _this.children.add(view);
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
      var process,
        _this = this;
      process = function() {
        return callback.call(_this, jade.templates[_this._getTemplateName()]);
      };
      if (jade.templates[this._getTemplateName()] != null) {
        setTimeout(function() {
          return process();
        });
      } else {
        $.getScript(this._getTemplateURL(), process);
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
