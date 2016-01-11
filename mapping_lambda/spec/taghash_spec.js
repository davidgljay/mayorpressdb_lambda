var TagHash = require('../taghash');

describe("TagHash", function() {
	describe("med_date function", function() {

		var releases, taghash;

		beforeEach(function() {
			releases = [];
			taghash = new TagHash();
		});

		it("should identify the median date from a set of date strings in ISO format", function() {
			for (var i = 10; i >= 2; i--) {
				releases.push({date:new Date("1/"+i+"/2016")});	
			}
			expect(taghash.med_date(releases)).toEqual(new Date("1/6/2016"));
		});

		it ("should take the average of two central dates when there is an even number of dates", function() {
			for (var i = 10; i >= 1; i--) {
				releases.push({date:new Date("1/"+i+"/2016")});	
			}
			expect(taghash.med_date(releases)).toEqual(new Date("2016-01-06T17:00:00.000Z"));
		});
	});

	describe("parsetags function", function() {
		var tags, taghash;

		beforeEach(function() {
			var articles = [];
			taghash = new TagHash();
			for (var i = 20 - 1; i >= 1; i--) {
				articles.push({
					title:"An Article",
					date:new Date("1/"+i+"/2016")
				});
			}

			tags=[{
				tag:"tag",
				articles:articles,
				city_nameNewYorkCity:"New York City",
				city_articlesNewYorkCity:articles,
				person_articlesBillDeblasio:articles
			},
			{
				tag:"tag2",
				articles:articles,
				city_nameNewYorkCity:"New York City",
				city_articlesNewYorkCity:articles,
				person_articlesBillDeblasio:articles
			}
			];
		});

		it("should add tags in the proper format to the overall map", function() {
			taghash.parsetags(tags);
			expect(taghash.maps.all[1]).toEqual({
				tag:'tag',
				count:19,
				med_date:new Date("Sun Jan 10 2016 00:00:00 GMT-0500 (EST)")
			});
		});
	});
});