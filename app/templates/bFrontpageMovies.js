jade.templates = jade.templates || {};
jade.templates['bFrontPageMovies'] = (function(){
  return function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('===Frontpage movies===<div id="pagination" class="otherPlaceholder"></div>');
}
return buf.join("");
};
})();