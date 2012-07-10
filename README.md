app-dust-backbone
=================

Строим client-side application.
Считаем его пока чем-то смешанным между менеджером шаблонов, и менеджером разметки.


Inn.View
--------

extends Backbone.View

**initialize(options)**

Internally called on *new Inn.View()* invocation

Accepts options object.

*model, collection, el, id, className, tagName and attributes* options are attached directly to view object
Other options attached to *view.options* object

*Inn-specific options:*
templateFolder (default: '') - template file folder for ajax loading
templateFormat (default: 'js') - template file format for ajax loading
templateName - override template filename with predefined value
templateURL - ovveride full template URL with predefined value


**render**

Renders view

Uses attached model as data source


**remove**

Undelegates all event listeners and clears view.el to its initial state



Inn.Model
---------

extends Backbone.Model



Inn.Collection
--------------

extends Backbone.Collection



Inn.DataManager
---------------

**addDataAsset(dataAsset, id)**

Accepts Inn.Model or Inn.Collection instances and stores them by their id.

If id parameter is present, uses it to store and retrieve dataAsset.


**getDataAsset(name)**

Retrives dataAsset by its name (id). If asset is not found returns null.


**removeDataAsset(name)**

Removes dataAsset from manager by it's name (id). If asset is not found returns null.



Inn.Layout
----------

Template manager. Think of layout as one page of an app.

Extends Backbone.Events

Requires an instance of Inn.DataManager as *options.dataManager*

Requiers *options.partials* object

`
  'header': {}
  'footer':
    'attributes':
      'class': 'bHeader'
      'data-some': 'some_data'
    'templateURL': 'bFooter'
  'content':
    'templateURL': 'bFrontpage'
    'partials':
      'tags': {}
      'sortings': {}
      'promoMovie': {}
      'frontPageMovies':
        'templateURL': 'bFrontPageMoviesList',
        'partials':
          'pagination': {}
  'someView': {}
`

For each index of partials processRoutes function creates or associates view by the name if the index

templateName overrides view's templateName

templateURL overrides view's templateURL

Each route can contain partials with same principles

Each partial can also have partials

For each parital processRoutes function created or associated view by it's name (index in object)

Routes and partials should have unique names

Attributes object will be passed to Inn.View constructor on processPartials


**Accepts**

*templateOptions* object
templateOptions.templateFolder (default: '') - template file folder for ajax loading, used for automatically created views also
templateOptions.templateFormat (default: 'js') - template file format for ajax loading, used for automatically created views also
templateName - override template filename of the layout with predefined value
templateURL - ovveride full template URL of the layout with predefined value

*id*

if id is not defined, id is set to 'layout'


**render**

Renders layout and appends it to #%layout.id% element on page

Then renders all of the views defined in layout_config object


**processPartials**

Parsed options.partials and assocciates each view with corresponding options.partials branch

If view with needed index is not added to layout, it is created autamatically

For all already defined and added views template options are set according to options.partials object


**addView(view)**

Adds view to layout by its name

Does not overwrite already added view with the same name


**getView(view)**

Retrieves view from Layout by name

If view is not found returns null


**removeView(view)**

Removes view from layout by name

If view is not found returns null

**destroy**

Clears all views and removes links to them
