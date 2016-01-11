var Taghash = function() {
	this.maps = {
		all_tags:[]
	};
};

Taghash.prototype.parsetags = function(tags) {
	var self = this;
	for (var i = tags.length - 1; i >= 0; i--) {
		var tag = tags[i];
		self.maps.all_tags.push({
			tag:tag.tag,
			count:tag.articles.length,
			med_date:med_date(tag.articles)
		});

		self.maps[tag.tag] = {
			tag:tag.tag,
			cities:[]
		};

		for (var key in tag) {
			if (key.slice(0,13)=="city_articles") {
				var city = key.slice(13),
				city_name=tag['city_name'+city];
				if (!self.maps.hasOwnProperty(city)) {
					self.maps[city] = {
						city:city_name,
						tags:[]
					};
				}
				self.maps[city].tags.push({
					tag:tag.tag,
					count:tag[key].length,
					med_date:med_date(tag[key]),
					articles:tag[key]
				});
				self.maps[tag.tag].cities.push({
					city:city_name,
					count:tag[key].length,
					med_date:med_date(tag[key]),
					articles:tag[key]
				})
			}
		}
	}
};

var dynamo_prep = Taghash.prototype.dynamo_prep = function(map) {
	var items = [];
	for (var key in map) {
		map[key].map_name=key;
		items.push({M:map[key]});
	}
	return items;
}

var med_date = Taghash.prototype.med_date = function(releases) {
	//Sort the array of releases by date
	releases = releases.sort(function(a,b) {
		return Date.parse(a.date)-Date.parse(b.date);
	});

	//If an odd number of releases
	var halfway = releases.length/2;
	if (releases.length%2===1) {
		return releases[halfway-0.5].date;
	} else {
	//If an even number of releases
		return new Date((Date.parse(releases[halfway].date) + Date.parse(releases[halfway+1].date))/2);
	}
};

module.exports=Taghash;