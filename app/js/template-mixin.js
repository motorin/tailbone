(function() {
  var _ref;

  if ((_ref = window.Inn) == null) {
    window.Inn = {};
  }

  Inn.TemplateMixin = {
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
    _getTemplate: function() {
      var view, _ref1;
      if (((_ref1 = this.templateDeferred) != null ? _ref1.state() : void 0) === 'pending') {
        return this.templateDeferred;
      }
      this.templateDeferred = new $.Deferred();
      if (typeof this._template === 'function') {
        this.templateDeferred.resolve();
        return this.templateDeferred;
      }
      view = this;
      $.getScript(this._getTemplateURL(), function() {
        view._template = function(data) {
          var rendered_html;
          rendered_html = '';
          dust.render(this._getTemplateName(), data, function(err, text) {
            return rendered_html = text;
          });
          return rendered_html;
        };
        return view.templateDeferred.resolve();
      });
      return this.templateDeferred;
    },
    render: function() {
      var _this = this;
      if (this._renderDeferred && this._renderDeferred.state() === 'pending') {
        return this._renderDeferred;
      }
      if (this.options.layout) {
        this.options.layout._viewsUnrendered.push(this);
      }
      this._renderDeferred = new $.Deferred();
      this._getTemplate().done(function() {
        var name, partial, _ref1, _results;
        if (_this.$el != null) {
          if (_this.attributes) {
            if (typeof _this.attributes === 'function') {
              _this.$el.attr(_this.attributes());
            } else {
              _this.$el.attr(_this.attributes);
            }
          }
          _this.$el.html(_this._template(_this.getDataForView()));
          _this.trigger('render', _this);
          return _this._renderDeferred.resolve();
        } else {
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
        }
      });
      return this._renderDeferred;
    }
  };

}).call(this);
