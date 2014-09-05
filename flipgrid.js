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

// This is primarily for interpreting Picasa results
$.fn.filterNode = function(name) {
	return this.find('*').filter(function() {
		return this.nodeName === name;
	});
};

var flipgrid = function(div, load, numCols, tileWidth) {
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
	
	this.minrows = Math.max(4, this.cols());

	this.load = load;

	// Component of a tile
	this.card = $('<div>').addClass('tile-card').append(
					$('<div>').addClass('front tile'),
					$('<div>').addClass('back tile')
					);

	// Tile container.
	this.tileContainer = $('<div>').addClass('tile-container').append(this.card);

	this.bind();
	
	// Important variables!
	this.PICASA_USER_ID = '103746199749981693463';
	this.FLICKR_USER_ID = '58906587@N08';
	this.FLICKR_API_KEY = '19602668a7978b7779de61db28e08a8b';
	this.FLICKR_METHOD  = 'flickr.people.getPublicPhotos';
	this.TUMBLR_BLOG_NAME = 'dreamynomad';
	this.INSTAGRAM_USER_ID = '426049466';
	this.INSTAGRAM_CLIENT_ID = '88087307878741f497b80cd5b5c8733d';
};

flipgrid.prototype = {

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

	width: function() {
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
			for (e in events) {
				if (events[e].selector == '.tile-container') {
					bound = true;
					break;
				}
			}
		}
		
		if (!bound) {
			var fg = this;

			this.div.on('click', '.tile-container', function(){
				var tile = $(this);
				
				if (tile.hasClass('flip')) {
					firstflip();
				} else {
					var img = new Image();
					img.onload = firstflip;
					img.src = tile.data('fullsize-url');
				}
			
				function firstflip() {
					
					var offset = null;
					
					if(this.src != undefined){
						
						offset = {
								'url': 'url(' + this.src + ')',
								'x': (fg.div.width() - this.width) / 2,
								'y': ($(window).height() - this.height) / 2 + $(window).scrollTop() - fg.div.offset().top,
								'width': this.width,
								'height': this.height,
						};
						
						if (offset.y > fg.div.height() - this.height) {
							offset.y = fg.div.height() - this.height;
						} else if (offset.y < 0){
							offset.y = 0;
						}
						
						// offset.y -= offset.y % this.size() - this.size() / 4;
						
						fg.createTileBack(tile, offset);
					}
					
					tile.toggleClass('flip');
					var width = fg.width();
					
					setTimeout(function() {
						if ((tile.index() + 1) % width != 0) {
							fg.flip(tile.next(), tile, offset);
						}
						if (tile.index() % width != 0) {
							fg.flip(tile.prev(), tile, offset);
						}

						fg.flip(tile.siblings().eq(tile.index() - width), tile, offset);
						fg.flip(tile.siblings().eq(tile.index() + width - 1), tile, offset);
					}, 100);
				}
			});
			
			var fg = this;
			$(window).scroll(function(e) {
		
				// Check if we reached bottom of the document
				if($(window).height() + $(window).scrollTop() >= fg.div.offset().top + fg.div.height() - fg.size() / 2) {
					
					if (fg.done) {
						fg.load(1 + Math.floor(($(window).height() + $(window).scrollTop() - (fg.div.offset().top + fg.div.height())) / fg.size()));
					}
				}
			});
		}
	},

	createTileBack: function(tile, offset) {
		var xpos = tile.position() ? -tile.position().left + offset.x : offset.x;
		var ypos = tile.position() ? -tile.position().top + offset.y : offset.y;
		
		$('.back', tile).css({
			'background-image': offset.url,
			'background-position': xpos + 'px ' + ypos + 'px',
		});
	},

	flip: function(tile, prev, offset) {
		// flip
		// or change picture if new picture is moving in
		if(prev.hasClass('flip') != tile.hasClass('flip') || (offset != undefined && prev.hasClass('flip') && $('.back', tile).css('background-image') != offset.url && $('.back', prev).css('background-image') == offset.url)){
			
			if (offset != undefined) {
				// if outside user's view, don't turn
				if(tile.position() && tile.position().top - offset.y < -this.size() + -4) 
					return;
				if(tile.position() && tile.position().top - offset.y > offset.height) 
					return;
				
				this.createTileBack(tile, offset);
			}
			
			if(!tile.hasClass('flip') || offset == undefined) // prevent turning if we're trying to set a partial pic
				tile.toggleClass('flip');
			
			var width = this.width();
			var fg = this;

			setTimeout(function() {

				if ((tile.index() + 1) % width != 0) {
					fg.flip(tile.next(), tile, offset);
				}
				if (tile.index() % width != 0) {
					fg.flip(tile.prev(), tile, offset);
				}

				fg.flip(tile.siblings().eq(tile.index() - width), tile, offset);
				fg.flip(tile.siblings().eq(tile.index() + width - 1), tile, offset);
			}, 100);
		}
	},

	addPhoto: function(smallURL, largeURL){
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
		$('.tile-container', this.div).css({
			'opacity': '1'
		});
		this.done = true;
	},

	getMinDim: function() {
		// Get the minimum dimension of the window and div
		// to determine the size of the photo to be downloaded.

		if (this.div.width() > 0) {
			return Math.min(this.div.width(), $(window).width(), $(window).height(), this.cols() * this.size());
		}
		return Math.min($(window).width(), $(window).height(), this.cols() * this.size());
	},




	/* API LOADING */
	loadPicasa: function(numpages){
		
		this.done = false;
		this.numpages = (numpages === undefined) ? Math.max(this.minrows, this.cols() - 1) : numpages;

		if (this.picasa_index === undefined) {
			this.picasa_index = 1;
		}
		
		var maxResults = this.numpages * this.cols();
		var fg = this;

		$.getJSON('http://picasaweb.google.com/data/feed/api/user/' + this.PICASA_USER_ID + '?kind=photo&thumbsize=' + 
			this.pickPicasaPhoto(this.size()) + 'c&imgmax=' + this.pickPicasaPhoto(this.getMinDim(), false) + 
			'&max-results=' + maxResults + '&start-index=' + fg.picasa_index + '&callback=?', 
				
				function(xmldata){

					var data = $.parseXML(xmldata);
					
					// Ignore if last id is the same
					if ($('entry', data).last().filterNode('gphoto:id').text() == fg.picasa_lastId)
						return;
					
					// Determine if we need to skip any photos by checking for the last id.
					var dupLastId = 0;
					if (fg.picasa_lastId) {
						$('entry', data).each(function() {
							if(dupLastId == 0 && fg.picasa_lastId == $(this).filterNode('gphoto:id').text()) {
								dupLastId = fg.picasa_lastId;
							}
						});
					} else {
						fg.picasa_lastId = 0;
					}
					
					// Add photos
					$('entry', data).each(function(){
						
						// If there are duplicates, iterate until we reach the last id.
						if (dupLastId != 0) {
							if (dupLastId == fg.picasa_lastId) {
								dupLastId == 0;
							}
							return;
						}
						
						fg.picasa_lastId = $(this).filterNode('gphoto:id').text();
						fg.picasa_index++;
						
						fg.addPhoto($(this).filterNode('media:thumbnail').attr('url'), $(this).filterNode('media:content').attr('url'));
					});
					
					fg.showTiles();
			});
	},

	pickPicasaPhoto: function(width, large) {
	// Picks a photo size based on the constraints.
		large = large === undefined ? true : large;

		var widths = [94, 110, 128, 200, 220, 288, 320, 400, 512, 576, 640, 720, 800, 912, 1024, 1152, 1280, 1440, 1600];

		if (large) {
			for (var w in widths) {
				if (widths[w] > width) {
					return widths[w];
				}
			}

			return widths[widths.length - 1];
		} else {
			for (var w in widths.reverse()) {
				if (widths[w] < width) {
					return widths[w];
				}
			}

			return widths[widths.length - 1];
		}
	},

	loadFlickr: function(numpages, curpage){		
		this.done = false;
		numpages = (numpages === undefined) ? Math.max(this.cols() - 1, this.minrows) : numpages;

		if (this.flickr_page === undefined) {
			this.flickr_page = 1;
		}

		curpage = (curpage === undefined) ? this.flickr_page : curpage;
		
		if (numpages <= 0 || curpage > this.flickr_pages)
			return;

		var fg = this;
		
		$.getJSON('https://api.flickr.com/services/rest/?method=' + this.FLICKR_METHOD + '&user_id=' + this.FLICKR_USER_ID + '&api_key=' + this.FLICKR_API_KEY + '&format=json&per_page=' + 
				this.cols() + '&page=' + curpage + '&jsoncallback=?', 
			function(data){
			
				fg.flickr_pages = data.photos.pages;
				fg.flickr_page++;
				
				for (var p in data.photos.photo) {
					var photo = data.photos.photo[p];
					fg.addPhoto(fg.flickrPhotoUrl(photo, fg.pickFlickrPhoto(fg.size())), 
						fg.flickrPhotoUrl(photo, fg.pickFlickrPhoto(fg.getMinDim(), false)));
				}
				
				if (numpages <= 1 || curpage >= fg.flickr_pages) {
					fg.showTiles();
				}
			
			}
		);
		
		this.loadFlickr(numpages - 1, curpage + 1);
	},

	flickrPhotoUrl: function(photo, size) {
		// http://www.flickr.com/services/api/misc.urls.html
		return 'http://farm' + photo.farm + '.static.flickr.com/' + photo.server + '/' + photo.id + '_' + photo.secret + '_' + size + '.jpg';
	},

	pickFlickrPhoto: function(width, large) {
		// http://www.flickr.com/services/api/misc.urls.html
		large = large === undefined ? true : large;

		var widths = [100, 240, 640, 1024];
		var suffixes = ['t', 'm', 'z', 'b'];

		if (large) {
			for (var w in widths) {
				if (widths[w] > width) {
					if (w < widths.length - 1) {
						return suffixes[parseInt(w, 10) + 1];
					}
					return suffixes[w];
				}
			}

			return suffixes[widths.length - 1];
		} else {
			suffixes.reverse();

			for (var w in widths.reverse()) {
				if (widths[w] < width) {
					return suffixes[w];
				}
			}

			return suffixes[widths.length - 1];
		}
	},

	loadTumblr: function(numpages){
		// http://www.tumblr.com/docs/en/api/v2#photo-posts
		this.done = false;
		numpages = (numpages > 0) ? numpages : Math.max(this.cols() - 1, this.minrows);

		if (this.tumblr_index === undefined)
			this.tumblr_index = 0;
		if (this.tumblr_posts === undefined)
			this.tumblr_posts = 0;

		if (numpages <= 0 || this.tumblr_index > this.tumblr_posts)
			return;
		
		var numposts = numpages * this.cols();

		var fg = this;
		
		$.getJSON('http://' + this.TUMBLR_BLOG_NAME + '.tumblr.com/api/read/json?type=photo&num=' + numposts + '&start=' + this.tumblr_index + '&callback=?', 
			function(data) {
			
				fg.tumblr_index += data.posts.length;
				fg.tumblr_posts = data['posts-total'];
				
				for (var p in data.posts) {
					var photo = data.posts[p];

					var width = parseInt(photo.width, 10);
					var height = parseInt(photo.height, 10);

					if (height >= width) {
						fg.addPhoto(photo[fg.pickTumblrPhoto(fg.size() * (height / width))], 
							photo[fg.pickTumblrPhoto(fg.getMinDim(), false)]);
					} else {
						fg.addPhoto(photo[fg.pickTumblrPhoto(fg.size() * (width / height))], 
							photo[fg.pickTumblrPhoto(fg.getMinDim(), false)]);
					}
				}
				
				fg.showTiles();
			}
		);
	},

	pickTumblrPhoto: function(width, large) {
		// Picks a photo size based on the constraints.
		large = large === undefined ? true : large;

		var widths = [75, 100, 250, 400, 500, 1280];

		if (large) {
			for (var w in widths) {
				if (widths[w] > width) {
					return 'photo-url-' + widths[w];
				}
			}

			return 'photo-url-' + widths[widths.length - 1];
		} else {
			for (var w in widths.reverse()) {
				if (widths[w] < width) {
					return 'photo-url-' + widths[w];
				}
			}

			return 'photo-url-' + widths[widths.length - 1];
		}
	},

	loadInstagram: function(numpages) {
		// http://instagram.com/developer/endpoints/users/
		this.done = false;
		numpages = (numpages > 0) ? numpages : Math.max(this.cols() - 1, this.minrows);

		if (numpages <= 0 || this.instagram_max_id == -2)
			return;

		var numposts = numpages * this.cols();

		var url = 'https://api.instagram.com/v1/users/' + this.INSTAGRAM_USER_ID + '/media/recent/?client_id=' + this.INSTAGRAM_CLIENT_ID + '&count=' + numposts + '&callback=?';

		if (this.instagram_max_id === undefined) {
			this.instagram_max_id = -1;
		} else {
			url += '&max_id=' + this.instagram_max_id;
		}

		var fg = this;

		$.getJSON(url, 
			function(data) {

				if (data && data.meta && data.meta.code == 200) {

					var max_id = fg.instagram_max_id;
					
					for (var p in data.data) {
						var images = data.data[p].images;

						var id = parseInt(data.data[p].id, 10);

						if (max_id == -1 || id < max_id) {
							max_id = id;
						}

						if (fg.instagram_max_id == -1 || id < fg.instagram_max_id) {
							fg.addPhoto(fg.pickInstagramPhoto(images, fg.size()), fg.pickInstagramPhoto(images, fg.getMinDim(), false));
						}
					}

					if (fg.instagram_max_id == -1 || max_id < fg.instagram_max_id) {
						fg.instagram_max_id = max_id;
						fg.showTiles();
					} else {
						fg.instagram_max_id = -2;
					}
				}
			}
		);
	},

	pickInstagramPhoto: function(images, width, large) {
		// Picks a photo size based on the constraints.
		large = large === undefined ? true : large;

		if (large) {
			if (images.thumbnail && images.thumbnail.width > width) {
				return images.thumbnail.url;
			} else if (images.low_resolution && images.low_resolution.width > width) {
				return images.low_resolution.url;
			} else {
				return images.standard_resolution.url;
			}
		} else {
			if (images.standard_resolution && images.standard_resolution.width < width) {
				return images.standard_resolution.url;
			} else if (images.low_resolution && images.low_resolution.width < width) {
				return images.low_resolution.url;
			} else {
				return images.thumbnail.url;
			}
		}
	},
};