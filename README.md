# flipgrid.js

flipgrid.js is a simple, content-focused photo gallery inspired by Microsoft's Metro interface and CSS 3D transitions.

Visit [ericleong.github.io/flipgrid.js](http://ericleong.github.io/flipgrid.js) for a demo.

## install

For those using [bower](http://bower.io/)

```bash
$ bower install flipgrid.js
```

## usage

First, add a reference to `flipgrid.js` and `flipgrid.css` in your `<head>`:

```HTML
<link rel="stylesheet" type="text/css" href="flipgrid.css" />
<script type="text/javascript" src="flipgrid.js"></script>
```

Then use it like this:

```Javascript
var flipgrid = new Flipgrid(<selector>, <delay>);
flipgrid.addPhoto(<small url>, <large url>);
```