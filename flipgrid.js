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

var Flipgrid = function(div, numCols, tileWidth) {

	this.div = $(div);

	if (numCols) {
		this.numCols = numCols;
	} else {
		if (tileWidth) {
			this.tileWidth = tileWidth;
		} else {
			this.numCols = this.div.width() > 0 ? Math.floor(this.div.width() / 200) : 6;
		}
	}

	// Component of a tile
	this.card = $('<div>').addClass('tile-card').append(
		$('<div>').addClass('front tile'),
		$('<div>').addClass('back tile')
	);

	// Tile container.
	this.tileContainer = $('<div>').addClass('tile-container').addClass('hidden').append(this.card);

	this.bind();
};

Flipgrid.prototype = {

	cols: function() {
		if (this.numCols) {
			return this.numCols;
		}

		return Math.floor(this.div.size() / this.size());
	},

	size: function() {
		if (this.tileWidth) {
			return this.tileWidth;
		}

		return Math.floor(this.div.width() / this.cols());
	},

	stride: function() {
		return Math.floor(this.div.width() / this.size());
	},

	resize: function() {
		var ratio = 100 / this.cols();

		$('.tile-container', this.div).css({
			'width': ratio + '%',
		});
	},

	bind: function() {
		var bound = false;

		if (this.div.data('events')) {
			var events = this.div.data('events').click;
			for (var e in events) {
				if (events[e].selector == '.tile-container') {
					bound = true;
					break;
				}
			}
		}

		if (!bound) {
			var fg = this;

			this.div.on('click', '.tile-container', function() {
				var tile = $(this);

				if (tile.hasClass('flip')) {
					firstflip();
				} else {
					var img = new Image();
					img.onload = firstflip;
					img.src = tile.data('fullsize-url');
				}

				function firstflip() {

					if (this.src) {
						// parent dimensions
						var parentStyle = window.getComputedStyle(fg.div.get(0));

						var parentWidth = parseInt(parentStyle.width, 10);
						var parentHeight = parseInt(parentStyle.height, 10);

						var parentTop = fg.div.get(0).getBoundingClientRect().top;

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
						var ratio = this.naturalWidth / this.naturalHeight;

						if (ratio * targetHeight > parentWidth) { // wide
							targetWidth = parentWidth;
							targetHeight = targetWidth / ratio;
							if (parentTop < 0) {
								offsetY = fg.div.get(0).offsetTop - parentTop + window.innerHeight / 2 - targetHeight / 2;
							} else {
								offsetY = (window.innerHeight) / 2 - targetHeight / 2;
							}
						} else { // tall
							targetWidth = ratio * targetHeight;

							if (parentTop < 0) {
								offsetY = fg.div.get(0).offsetTop - parentTop;
							} else {
								offsetY = parentTop;
							}
						}

						var offset = {
							'url': 'url(' + this.src + ')',
							'x': (parentWidth - targetWidth) / 2,
							'y': offsetY,
							'width': targetWidth,
							'height': targetHeight,
						};

						fg.createTileBack(tile, offset);
					}

					tile.toggleClass('flip');
					var stride = fg.stride();

					setTimeout(function() {
						if ((tile.index() + 1) % stride != 0) {
							fg.flip(tile.next(), tile, offset);
						}
						if (tile.index() % stride != 0) {
							fg.flip(tile.prev(), tile, offset);
						}

						fg.flip(tile.siblings().eq(tile.index() - stride), tile, offset);
						fg.flip(tile.siblings().eq(tile.index() + stride - 1), tile, offset);
					}, 100);
				}
			});
		}
	},

	createTileBack: function(tile, offset) {
		var xpos = tile.position() ? -tile.position().left + offset.x : offset.x;
		var ypos = tile.position() ? -tile.position().top + offset.y : offset.y;
		
		$('.back', tile).css({
			'background-image': offset.url,
			'background-size': (offset.width / tile.width() * 100) + '% ' + (offset.height / tile.height() * 100) + '%',
			'background-position': (-xpos / (offset.width - tile.width()) * 100) + '% ' + (-ypos / (offset.height - tile.height()) * 100) + '%',
		});
	},

	flip: function(tile, prev, offset) {
		// flip
		// or change picture if new picture is moving in
		if (prev.hasClass('flip') != tile.hasClass('flip') || (offset != undefined && prev.hasClass('flip') && $('.back', tile).css('background-image') != offset.url && $('.back', prev).css('background-image') == offset.url)) {

			if (offset != undefined) {
				// if outside user's view, don't turn
				if (tile.position() && tile.position().top - offset.y < -this.size() + -4)
					return;
				if (tile.position() && tile.position().top - offset.y > offset.height)
					return;

				this.createTileBack(tile, offset);
			}

			if (!tile.hasClass('flip') || offset == undefined) // prevent turning if we're trying to set a partial pic
				tile.toggleClass('flip');

			var stride = this.stride();
			var fg = this;

			setTimeout(function() {

				if ((tile.index() + 1) % stride != 0) {
					fg.flip(tile.next(), tile, offset);
				}
				if (tile.index() % stride != 0) {
					fg.flip(tile.prev(), tile, offset);
				}

				fg.flip(tile.siblings().eq(tile.index() - stride), tile, offset);
				fg.flip(tile.siblings().eq(tile.index() + stride - 1), tile, offset);
			}, 100);
		}
	},

	addPhoto: function(smallURL, largeURL) {
		var tile = this.tileContainer.clone();

		var ratio = 100 / this.cols();

		tile.css({
			'width': ratio + '%',
		});

		tile.data('fullsize-url', largeURL);

		$('.front', tile).css({
			'background-image': 'url(' + smallURL + ')'
		});

		this.div.append(tile);
	},

	showTiles: function() {
		$('.tile-container', this.div).addClass('visible').removeClass('hidden');
	}
};