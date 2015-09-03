// This is primarily for interpreting Picasa results
$.fn.filterNode = function(name) {
	return this.find('*').filter(function() {
		return this.nodeName === name;
	});
};

var Demo = function(flipgrid, load, cols) {
	// Important variables!
	this.PICASA_USER_ID = '103746199749981693463';
	this.FLICKR_USER_ID = '58906587@N08';
	this.FLICKR_API_KEY = '19602668a7978b7779de61db28e08a8b';
	this.FLICKR_METHOD = 'flickr.people.getPublicPhotos';
	this.TUMBLR_BLOG_NAME = 'dreamynomad';
	this.INSTAGRAM_USER_ID = '426049466';
	this.INSTAGRAM_CLIENT_ID = '88087307878741f497b80cd5b5c8733d';
	
	this.flipgrid = flipgrid;
	this.load =  load;
	
	this.cols = cols;
	
	this.minrows = Math.max(6, this.cols());
};

Demo.prototype = {
	
	size: function() {
		return this.flipgrid.div.width() / this.cols();
	},
	
	getMinDim: function() {
		// Get the minimum dimension of the window and div
		// to determine the size of the photo to be downloaded.

		if (this.flipgrid.div.width() > 0) {
			return Math.min(this.flipgrid.div.width(), $(window).width(), $(window).height(), this.cols() * this.size());
		}
		return Math.min($(window).width(), $(window).height(), this.cols() * this.size());
	},

	loadPicasa: function(numpages) {

		this.done = false;
		this.numpages = (numpages === undefined) ? Math.max(this.minrows, this.cols() - 1) : numpages;

		if (this.picasa_index === undefined) {
			this.picasa_index = 1;
		}

		var maxResults = this.numpages * this.cols();
		var demo = this;

		$.getJSON('http://picasaweb.google.com/data/feed/api/user/' + this.PICASA_USER_ID + '?kind=photo&thumbsize=' +
			this.pickPicasaPhoto(this.size()) + 'c&imgmax=' + this.pickPicasaPhoto(this.getMinDim(), true) +
			'&max-results=' + maxResults + '&start-index=' + demo.picasa_index + '&callback=?',

			function(xmldata) {

				var data = $.parseXML(xmldata);

				// Ignore if last id is the same
				if ($('entry', data).last().filterNode('gphoto:id').text() == demo.picasa_lastId)
					return;

				// Determine if we need to skip any photos by checking for the last id.
				var dupLastId = 0;
				if (demo.picasa_lastId) {
					$('entry', data).each(function() {
						if (dupLastId == 0 && demo.picasa_lastId == $(this).filterNode('gphoto:id').text()) {
							dupLastId = demo.picasa_lastId;
						}
					});
				} else {
					demo.picasa_lastId = 0;
				}

				// Add photos
				$('entry', data).each(function() {

					// If there are duplicates, iterate until we reach the last id.
					if (dupLastId != 0) {
						if (dupLastId == demo.picasa_lastId) {
							dupLastId == 0;
						}
						return;
					}

					demo.picasa_lastId = $(this).filterNode('gphoto:id').text();
					demo.picasa_index++;

					demo.flipgrid.addPhoto($(this).filterNode('media:thumbnail').attr('url'), $(this).filterNode('media:content').attr('url'));
				});

				demo.done = true;
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

	loadFlickr: function(numpages, curpage) {
		this.done = false;
		numpages = (numpages === undefined) ? Math.max(this.cols() - 1, this.minrows) : numpages;

		if (this.flickr_page === undefined) {
			this.flickr_page = 1;
		}

		curpage = (curpage === undefined) ? this.flickr_page : curpage;

		if (numpages <= 0 || curpage > this.flickr_pages)
			return;

		var demo = this;

		$.getJSON('https://api.flickr.com/services/rest/?method=' + this.FLICKR_METHOD + '&user_id=' + this.FLICKR_USER_ID + '&api_key=' + this.FLICKR_API_KEY + '&format=json&per_page=' +
			this.cols() + '&page=' + curpage + '&jsoncallback=?',
			function(data) {

				demo.flickr_pages = data.photos.pages;
				demo.flickr_page++;

				for (var p in data.photos.photo) {
					var photo = data.photos.photo[p];
					demo.flipgrid.addPhoto(demo.flickrPhotoUrl(photo, demo.pickFlickrPhoto(demo.size())),
						demo.flickrPhotoUrl(photo, demo.pickFlickrPhoto(demo.getMinDim(), true)));
				}

				if (numpages <= 1 || curpage >= demo.flickr_pages) {
					demo.done = true;
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

	loadTumblr: function(numpages) {
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

		var demo = this;

		$.getJSON('http://' + this.TUMBLR_BLOG_NAME + '.tumblr.com/api/read/json?type=photo&num=' + numposts + '&start=' + this.tumblr_index + '&callback=?',
			function(data) {

				demo.tumblr_index += data.posts.length;
				demo.tumblr_posts = data['posts-total'];

				for (var p in data.posts) {
					var photo = data.posts[p];

					var width = parseInt(photo.width, 10);
					var height = parseInt(photo.height, 10);

					if (height >= width) {
						demo.flipgrid.addPhoto(photo[demo.pickTumblrPhoto(demo.size() * (height / width))],
							photo[demo.pickTumblrPhoto(demo.getMinDim(), true)]);
					} else {
						demo.flipgrid.addPhoto(photo[demo.pickTumblrPhoto(demo.size() * (width / height))],
							photo[demo.pickTumblrPhoto(demo.getMinDim(), true)]);
					}
				}

				demo.done = true;
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

		var demo = this;

		$.getJSON(url,
			function(data) {

				if (data && data.meta && data.meta.code == 200) {

					var max_id = demo.instagram_max_id;

					for (var p in data.data) {
						var images = data.data[p].images;

						var id = parseInt(data.data[p].id, 10);

						if (max_id == -1 || id < max_id) {
							max_id = id;
						}

						if (demo.instagram_max_id == -1 || id < demo.instagram_max_id) {
							demo.flipgrid.addPhoto(demo.pickInstagramPhoto(images, demo.size()), demo.pickInstagramPhoto(images, demo.getMinDim(), true));
						}
					}

					if (demo.instagram_max_id == -1 || max_id < demo.instagram_max_id) {
						demo.instagram_max_id = max_id;
						
						if (data.data.length < numposts) {
							console.log(Math.floor((numposts - data.data.length) / demo.cols()));
							demo.loadInstagram(Math.floor((numposts - data.data.length) / demo.cols()));
						} else {
							demo.done = true;
						}
						
					} else {
						demo.instagram_max_id = -2;
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
	}
};