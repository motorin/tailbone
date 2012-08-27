(function() {
  var _ref;

  if ((_ref = window.Inn) == null) {
    window.Inn = {};
  }

  Inn.TemplateMixin = {
    _getTemplateURL: function() {
      var devider;
      devider = this.options.templateFolder ? '/' : '';
      if (this.options.templateURL == null) {
        return this.options.templateFolder + devider + this._getTemplateName() + '.' + this.options.templateFormat;
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
      var view;
      if (this.templateDeferred && this.templateDeferred.state() === 'pending') {
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
    }
  };

}).call(this);
