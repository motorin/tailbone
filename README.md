Tailbone
=================

Каркас JavaScript приложения. Обеспечивает логическую структуру для рендеринга вложенных блоков на фронтенде.

Спроектирован с учётом минимального проникновения верстальщика в JavaScript код.


## Contribution ##

Для сборки проекта используется [Grunt.js](http://gruntjs.com).

Чтобы пересобрать проект выполните `grunt` в каталоге проекта.

Также Вы можете выполнить сборку отдельных частей. Для этого выполните `grunt <target>`.

Доступны следующие цели:

* lint - проверяет код на соответствие стандартам
* test - запускает тесты
* docco - генерирует документацию в стиле "annotated source"
* watch - следит за изменениями файлов и пересобирает проект


## Тестирование ##

Тесты написаны с использованием библиотеки [qUnit](http://qunitjs.com).

Чтобы запускать тесты из консоли необходимо установить [PhantomJS](http://phantomjs.org/). 
Инструкцию по установке для вашей системы можно найти [тут](http://phantomjs.org/download.html)

Для запуска тестов необходимо выполнить `grunt test`, либо открыть /app_tests.html в браузере. 
Также тесты выполняются автоматически при каждом запуске `grunt`.

Результаты тестов в формате **JUnit XML** складываются в папку `/.junit-output/`. 
Вы можете изменить название каталога для вывода результатов тестов, задав 
значение переменной окружения `JUNIT_OUTPUT`.


## Загрузка и подключение ##

Для работы Tailbone необходимы:

* [jQuery](http://jquery.com)
* [Underscore.JS](http://underscorejs.org)
* [Backbone.JS](http://backbonejs.org)
* [Require.JS](http://requirejs.org)

На данный момент, также есть необходимость в подключении [jade runtime](https://github.com/visionmedia/jade/blob/master/runtime.js)

После подключения этих зависимостей, может быть загружен Tailbone.

### AMD ###

Tailbone поддерживает загрузку в экосистеме [AMD](http://requirejs.org/docs/whyamd.html). 
Вот шаблон конфига [Reguire.JS shim](http://requirejs.org/docs/api.html#config-shim).

``` javascript
shim: {

	// ...

	'backbone.layoutmanager': {
		deps: ['jquery', , 'backbone'],
		exports: function() {
			return window.Inn;
		}
	}

	// ...
}
```


## Usage ##

Tailbone содержит следующие классы:

* Inn.Collection
* Inn.Model
* Inn.DataManager
* Inn.View
* Inn.ViewsCollection

### Inn.Collection и Inn.Model ###

Пока что, это просто обёртки над Backbone.Collection и Backbone.Model.

Их стоит использовать с учётом того, что в будущем они могут быть расширены 
и Вы получите дополнительный функционал.

### Inn.View ###

Inn.View - это сердце Tailbone. Этот класс предназначен для декларации, рендеринга и обновления больших, вложенных блоков.

#### Partials ####

Одним из основных достоинств Inn.View является поддержка partials. Partials могут быть определены двумя путями.

Во-первых - при создании экземляра Inn.View, для этого достаточно просто передать массив вложенных View либо их конфигов, 
вторым параметром, в конструктор Inn.View.

Второй вариант в шаблоне View создать тег с классом **bPartial** и атрибутом **data-view-template**, указывающим на имя шаблона дочерней View

Все partials будут собраны и отрендеренны при рендеринге основного View.

Вложенность partials не ограниченна, однако стоит учитывать, что большая вложенность может негативно сказаться на производительности.

#### Создание ####

Пример создания простого View:

```coffescript
# объявляем новый класс унаследованный от Inn.View
MyAwesomeView = Inn.View.extend
    options:
      partialClassName: 'bPartial' # класс для поиска pratials

# создаём экземпляр новоиспечённого класса
myAwesomeView = new MyAwesomeView
	id: myAwesomeView # не забываем задать id корневому элементу
```

#### Рендеринг ####

Пример рендеринга View:

```coffescript
myAwesomeView.render()
myAwesomeView.on 'ready', ->
	console.log "Holy macaroni! It's rendered!" 
```

Нужно учитывать, что корневая View (которая не явлеятся чьим-либо partial) не будет добалена в DOM 
после завершения рендеринга. Это необходимо сделать руками. `myAwesomeView.$el.appendTo(document.body)`