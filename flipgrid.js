/* 
flipgrid.js

Eric Leong
October 12, 2012

Copyright (c) 2012, Eric Leong
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

var Flipgrid = function(div, delay) {
	this.div = div;
	this.delay = delay || 100;
};

Flipgrid.createTileBack = function(tile, offset) {
	if (tile) {
		var rect = tile.getBoundingClientRect();
		var left = rect.left + tile.offsetParent.scrollLeft;
		var top = rect.top + tile.offsetParent.scrollTop;
		var backs = tile.getElementsByClassName('back');

		if (backs && backs[0]) {
			backs[0].style.backgroundImage = offset.url;
			backs[0].style.backgroundSize = (offset.width / rect.width * 100) + '% ' + (offset.height / rect.height * 100) + '%';
			backs[0].style.backgroundPosition = ((left - offset.x) / (offset.width - rect.width) * 100) + '% ' + ((top - offset.y) / (offset.height - rect.height) * 100) + '%';
		}
	}
};

Flipgrid.flipper = function(tile, stride, offset, delay) {
	var siblings = Array.prototype.slice.call(tile.parentNode.children);
	var index = siblings.indexOf(tile);

	if (index + 1 % stride != 0) {
		Flipgrid.flip(tile.nextElementSibling, tile, stride, offset, delay);
	}
	if (index % stride != 0) {
		Flipgrid.flip(tile.previousElementSibling, tile, stride, offset, delay);
	}
	if (index - stride >= 0) {
		Flipgrid.flip(siblings[index - stride], tile, stride, offset, delay);
	}
	if (index + stride < siblings.length) {
		Flipgrid.flip(siblings[index + stride], tile, stride, offset, delay);
	}
};

Flipgrid.flip = function(tile, prev, stride, offset, delay) {
	if (tile == undefined || prev == undefined || tile.classList == undefined || prev.classList == undefined) {
		return;
	}

	// flip
	// or change picture if new picture is moving in
	if (prev.classList.contains('flip') != tile.classList.contains('flip') || (offset && prev.classList.contains('flip') && tile.getElementsByClassName('back')[0].style.backgroundImage != offset.url && prev.getElementsByClassName('back')[0].style.backgroundImage == offset.url)) {

		if (offset) {
			var rect = tile.getBoundingClientRect();
			var top = rect.top + tile.offsetParent.scrollTop;

			// if outside user's view, don't turn
			if (top - offset.y < -rect.height)
				return;
			if (top - offset.y > offset.height)
				return;

			Flipgrid.createTileBack(tile, offset);
		}

		// prevent turning if we're trying to set a partial pic
		if (!tile.classList.contains('flip') || offset == undefined) {
			tile.classList.toggle('flip');
		}

		setTimeout(function() {
			Flipgrid.flipper(tile, stride, offset, delay);
		}, delay);
	}
};

Flipgrid.stride = function(div, tileWidth) {
	if (div && tileWidth > 0) {
		return Math.floor(div.getBoundingClientRect().width / tileWidth);
	} else {
		return 5;
	}
};

Flipgrid.startFlip = function(div, tile, delay, src, naturalWidth, naturalHeight) {
	if (src && naturalWidth > 0 && naturalHeight > 0) {
		// parent dimensions
		var parentStyle = window.getComputedStyle(div);

		var parentWidth = parseInt(parentStyle.width, 10);
		var parentHeight = parseInt(parentStyle.height, 10);

		var parentTop = div.getBoundingClientRect().top;

		// determine maximum height
		var targetHeight = window.innerHeight;

		if (parentHeight < window.innerHeight) {
			targetHeight = parentHeight;
		} else if (parentTop > 0) {
			targetHeight -= parentTop;
		}

		// calculate width + height
		var targetWidth;
		var offsetY;
		var ratio = naturalWidth / naturalHeight;

		if (ratio * targetHeight > parentWidth) { // wide
			targetWidth = parentWidth;
			targetHeight = targetWidth / ratio;
			if (parentTop < 0) {
				offsetY = div.offsetTop - parentTop + window.innerHeight / 2 - targetHeight / 2;
			} else {
				offsetY = (window.innerHeight) / 2 - targetHeight / 2;
			}
		} else { // tall
			targetWidth = ratio * targetHeight;

			if (parentTop < 0) {
				offsetY = div.offsetTop - parentTop;
			} else {
				offsetY = parentTop;
			}
		}

		console.log(offsetY);

		var offset = {
			'url': 'url(' + src + ')',
			'x': (parentWidth - targetWidth) / 2,
			'y': offsetY,
			'width': targetWidth,
			'height': targetHeight,
		};

		Flipgrid.createTileBack(tile, offset);
	}

	tile.classList.toggle('flip')
	var stride = Flipgrid.stride(div, tile.getBoundingClientRect().width);

	setTimeout(function() {
		Flipgrid.flipper(tile, stride, offset, delay);
	}, delay);
};

Flipgrid.prototype = {

	addPhoto: function(smallURL, largeURL) {

		// build tile.
		var tile = document.createElement('div');
		tile.classList.add('tile-container');
		var card = document.createElement('div');
		card.classList.add('tile-card');
		var front = document.createElement('div');
		front.classList.add('front', 'tile');
		var back = document.createElement('div');
		back.classList.add('back', 'tile');

		card.appendChild(front);
		card.appendChild(back);
		tile.appendChild(card);

		// set background image.
		front.style.backgroundImage = 'url(' + smallURL + ')';

		var div = this.div;
		var delay = this.delay;

		tile.addEventListener('click', function() {
			if (tile.classList.contains('flip')) {
				Flipgrid.startFlip(div, tile, delay);
			} else {
				var img = new Image();
				img.onload = function() {
					Flipgrid.startFlip(div, tile, delay, img.src, img.naturalWidth, img.naturalHeight);
				};
				img.src = largeURL;
			}
		}, false);

		this.div.appendChild(tile);
	}
};