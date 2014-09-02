flipgrid.js
===========
flipgrid.js is a simple, content-focused photo gallery inspired by Microsoft's Metro interface and CSS 3D transitions.

Visit [ericleong.github.io/flipgrid.js](http://ericleong.github.io/flipgrid.js) for a demo.

Demo
----
Install python, and in your terminal, run

	python -m SimpleHTTPServer

and visit 

	localhost:8000/demo.html

in your browser.

Usage
-----
```Javascript
var fg = new flipgrid(<selector>, <image loader>, <number of columns>);
fg.load();
```
where `<image loader>` is one of 
- `flipgrid.prototype.loadTumblr`
- `flipgrid.prototype.loadFlickr`
- `flipgrid.prototype.loadPicasa`
- `flipgrid.prototype.loadInstagram`
