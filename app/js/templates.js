jade.templates = jade.templates || {};
jade.templates['bFooter'] = (function(){
  return function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('===Footer===');
}
return buf.join("");
};
})();
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
jade.templates = jade.templates || {};
jade.templates['bHeader'] = (function(){
  return function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('===Header===');
}
return buf.join("");
};
})();
jade.templates = jade.templates || {};
jade.templates['bHolyView'] = (function(){
  return function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('===Content===<div id="frontPageMovies" class="bPartial"></div>');
}
return buf.join("");
};
})();
jade.templates = jade.templates || {};
jade.templates['bPagination'] = (function(){
  return function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('===Pagination===');
}
return buf.join("");
};
})();
jade.templates = jade.templates || {};
jade.templates['bPromoMovie'] = (function(){
  return function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('===PromoMovie===');
}
return buf.join("");
};
})();
jade.templates = jade.templates || {};
jade.templates['bSomeView'] = (function(){
  return function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<div>Some content</div>');
}
return buf.join("");
};
})();
jade.templates = jade.templates || {};
jade.templates['bSortings'] = (function(){
  return function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('===Sortings===');
}
return buf.join("");
};
})();
jade.templates = jade.templates || {};
jade.templates['bTags'] = (function(){
  return function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('===Tags===');
}
return buf.join("");
};
})();
jade.templates = jade.templates || {};
jade.templates['bTranslated'] = (function(){
  return function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<div>');
var __val__ = Inn.i18n['CheckingFiles']
buf.push(escape(null == __val__ ? "" : __val__));
buf.push('</div>');
}
return buf.join("");
};
})();