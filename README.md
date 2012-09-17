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