var Taghash = function() {
	this.maps = {
		all:[]
	};
};

Taghash.prototype.parsetags = function(tags) {
	var self = this;
	for (var i = tags.length - 1; i >= 0; i--) {
		var tag = tags[i];
		self.maps.all.push({
			tag:tag.tag,
			count:tag.articles.length,
			med_date:med_date(tag.articles)
		});
		for (var key in tag) {
			if (key.slice(0,9)=="city_articles") {
				var city = key.slice(9),
				city_name=tag['city_name'+city];
				if (!self.maps.hasOwnProperty(city)) {
					self.maps[city] = {
						city:cityame,
						tags:[]
					};
				}
				self.maps[city].tags.push({
					tag:tag.name,
					
				});
				concat(tag['city_articles' + city]);
			} else {

			}
			/*
			* If the tag starts with city_name get the name of the city.
			* See if hash has that city yet. If not create an array.
			* Push this tag to the city array, along with the count and med_date of city_articles
			*/

			/*
			* Do a similar thing for people. Find each tag starting with person and move them into the appropriate city hash.
			*/

			/*
			* Finally, do a similar thing for each city_tag. 
			*/
		}
	}
};

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