// This is primarily for interpreting Picasa results
$.fn.filterNode = function(name) {
	return this.find('*').filter(function() {
		return this.nodeName === name;
	});
};

var Demo = function(flipgrid, load, cols) {
	// Important variables!
	this.PICASA_USER_ID = '';
	this.FLICKR_USER_ID = '';
	this.FLICKR_API_KEY = '';
	this.FLICKR_METHOD = 'flickr.people.getPublicPhotos';
	this.TUMBLR_BLOG_NAME = 'dreamynomad';
	this.INSTAGRAM_USER_ID = '';
	this.INSTAGRAM_CLIENT_ID = '';
	
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
	}
};