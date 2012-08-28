(function() {
  var _ref;

  if ((_ref = window.Inn) == null) {
    window.Inn = {};
  }

  Inn.View = Backbone.View.extend({
    initialize: function(options) {
      this.options = $.extend({}, {
        templateFolder: '',
        templateFormat: 'js'
      }, options);
      return this;
    },
    getDataForView: function() {
      if (this.model) {
        return this.model.toJSON();
      }
    },
    remove: function() {
      this.undelegateEvents();
      this.$el.empty().remove();
      this.trigger('remove');
      this.options.isInDOM = false;
      return this;
    }
  });

  _.extend(Inn.View.prototype, Inn.TemplateMixin);

}).call(this);
