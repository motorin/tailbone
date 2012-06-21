var layout = {
  'header': {
    view: 'bHeader'
  },
  'footer': {
    view: 'bFooter'
  },
  'content': {
  }
}


var Router = Backbone.Router.extend({

  routes: {
    "":                 "frontpage",
  },
  
  frontpage: function(){
    var frontpageLayout  = $.extend({}, layout, {
      'content': {
        view: 'bFrontpage',
        partials: [
          {
            'tags': {
              view: 'bTags'
            }
          },{
            'sortings': {
              view: 'bSortings'
            }
          },{
            'promoMovie': {
              view: 'bPromoMovie'
            }
          },{
            'movies': {
              view: 'bFrontPageMovies',
              partials: [
                {
                  'pagination': {
                    view: 'bPagination'
                  }
                }
              ]
            }
          }
        ]
      }
    });
    
  }
});

new Router();



var InnView = Backbone.View.extend({
  
});

var innApp = {
  process: function(layout){
    recursion(layout);
    tab = '';
  },
  
  getViewByName: function(name){
    var view = this.views['name'];
    if(view){
      return view;
    }
    return false;
  },
  
  createView: function(name){
    if(!this.viewConstructors[name]){
      return new InnView();
    }
    return new this.viewConstructors[name];
  },
  
  addView: function(view){
    console.log(view);
    this.views.add(view);
    return this.views;
  },
  
  views: {
    
  },
  
  viewConstructors: {
  },
  
  registerViewConstructor: function(name, constructor){
    return this.viewConstructors[name] = constructor;
  }
}



var tab = '';

function recursion(layout){
  $.each(layout, function(index){
    console.log(tab+index);
    if(this.partials){
      tab += '-';
      $.each(this.partials, function(index){
        recursion(this);
      });
    }
  })
}

Backbone.history.start();