jade.templates = jade.templates || {};
jade.templates['bFrontpage'] = (function(){
  return function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('===Content===<div id="tags"></div><div id="sortings"></div><div id="promoMovie"></div><div id="frontPageMovies"></div>');
}
return buf.join("");
};
})();