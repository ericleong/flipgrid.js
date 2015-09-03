/// <reference path="typings/jquery/jquery.d.ts"/>
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

	this.div = $(div);

	// Tile container.
	this.tileContainer = $('<div>').addClass('tile-container').append(
		$('<div>').addClass('tile-card').append(
			$('<div>').addClass('front tile'),
			$('<div>').addClass('back tile')));

	this.delay = delay || 100;
};

Flipgrid.createTileBack = function(tile, offset) {
	var xpos = tile.position() ? -tile.position().left + offset.x : offset.x;
	var ypos = tile.position() ? -tile.position().top + offset.y : offset.y;

	var elem = tile.get(0);

	if (elem) {
		var rect = elem.getBoundingClientRect();

		$('.back', tile).css({
			'background-image': offset.url,
			'background-size': (offset.width / rect.width * 100) + '% ' + (offset.height / rect.height * 100) + '%',
			'background-position': (-xpos / (offset.width - rect.width) * 100) + '% ' + (-ypos / (offset.height - rect.height) * 100) + '%',
		});
	}
};

Flipgrid.flipper = function(tile, stride, offset, delay) {
	if ((tile.index() + 1) % stride != 0) {
		Flipgrid.flip(tile.next(), tile, stride, offset, delay);
	}

	if (tile.index() > 0 && tile.index() % stride != 0) {
		Flipgrid.flip(tile.prev(), tile, stride, offset, delay);
	}

	if (tile.index() - stride >= 0) {
		Flipgrid.flip(tile.siblings().eq(tile.index() - stride), tile, stride, offset, delay);
	}

	Flipgrid.flip(tile.siblings().eq(tile.index() + stride - 1), tile, stride, offset, delay);
};

Flipgrid.flip = function(tile, prev, stride, offset, delay) {
	// flip
	// or change picture if new picture is moving in
	if (prev.hasClass('flip') != tile.hasClass('flip') || (offset != undefined && prev.hasClass('flip') && $('.back', tile).css('background-image') != offset.url && $('.back', prev).css('background-image') == offset.url)) {

		if (offset != undefined) {
			// if outside user's view, don't turn
			if (tile.position() && tile.position().top - offset.y < -tile.height())
				return;
			if (tile.position() && tile.position().top - offset.y > offset.height)
				return;

			Flipgrid.createTileBack(tile, offset);
		}

		// prevent turning if we're trying to set a partial pic
		if (!tile.hasClass('flip') || offset == undefined) {
			tile.toggleClass('flip');
		}

		setTimeout(function() {
			Flipgrid.flipper(tile, stride, offset, delay);
		}, delay);
	}
};

Flipgrid.prototype = {

	stride: function(tileWidth) {
		if (tileWidth > 0) {
			return Math.floor(this.div.get(0).getBoundingClientRect().width / tileWidth);
		} else {
			return 5;
		}
	},

	startFlip: function(tile, src, naturalWidth, naturalHeight) {
		if (src && naturalWidth > 0 && naturalHeight > 0) {
			// parent dimensions
			var parentStyle = window.getComputedStyle(this.div.get(0));

			var parentWidth = parseInt(parentStyle.width, 10);
			var parentHeight = parseInt(parentStyle.height, 10);

			var parentTop = this.div.get(0).getBoundingClientRect().top;

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
					offsetY = this.div.get(0).offsetTop - parentTop + window.innerHeight / 2 - targetHeight / 2;
				} else {
					offsetY = (window.innerHeight) / 2 - targetHeight / 2;
				}
			} else { // tall
				targetWidth = ratio * targetHeight;

				if (parentTop < 0) {
					offsetY = this.div.get(0).offsetTop - parentTop;
				} else {
					offsetY = parentTop;
				}
			}

			var offset = {
				'url': 'url(' + src + ')',
				'x': (parentWidth - targetWidth) / 2,
				'y': offsetY,
				'width': targetWidth,
				'height': targetHeight,
			};

			Flipgrid.createTileBack(tile, offset);
		}

		tile.toggleClass('flip');
		var stride = this.stride(tile.get(0).getBoundingClientRect().width);
		var delay = this.delay;

		setTimeout(function() {
			Flipgrid.flipper(tile, stride, offset, delay);
		}, delay);
	},

	addPhoto: function(smallURL, largeURL) {
		var tile = this.tileContainer.clone();

		tile.data('fullsize-url', largeURL);

		$('.front', tile).css({
			'background-image': 'url(' + smallURL + ')'
		});

		var fg = this;

		tile.on('click', function() {
			var tile = $(this);

			if (tile.hasClass('flip')) {
				fg.startFlip(tile);
			} else {
				var img = new Image();
				img.onload = function() {
					fg.startFlip(tile, img.src, img.naturalWidth, img.naturalHeight);
				};
				img.src = tile.data('fullsize-url');
			}
		});

		this.div.append(tile);
	}
};