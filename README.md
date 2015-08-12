flipgrid.js
===========
flipgrid.js is a simple, content-focused photo gallery inspired by Microsoft's Metro interface and CSS 3D transitions.

Visit [ericleong.github.io/flipgrid.js](http://ericleong.github.io/flipgrid.js) for a demo.

Usage
-----

First, add a reference to `flipgrid.js` and `flipgrid.css` in your HTML file, like this:
```HTML
<link rel="stylesheet" type="text/css" href="flipgrid.css" />
<script type="text/javascript" src="flipgrid.js"></script>
```

```Javascript
var fg = new flipgrid(<selector>, <image loader>, <number of columns>);
fg.load();
```
where `<image loader>` is one of 
- `flipgrid.prototype.loadTumblr`
- `flipgrid.prototype.loadFlickr`
- `flipgrid.prototype.loadPicasa`
- `flipgrid.prototype.loadInstagram`
