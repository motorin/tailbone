jade.templates = jade.templates || {};
jade.templates['bTranslated'] = (function(){
  return function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<div>');
var __val__ = Inn.i18n['Game-Panel']['CheckingFiles']
buf.push(escape(null == __val__ ? "" : __val__));
buf.push('</div>');
}
return buf.join("");
};
})();