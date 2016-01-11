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
		var tags, taghash, articles;

		beforeEach(function() {
			articles = [],
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
				person_articlesBillDeblasio:articles,
				city_nameLosAngeles:"Los Angeles",
				city_articlesLosAngeles:articles
			}
			];
			taghash.parsetags(tags);
		});

		it("should add tags in the proper format to the overall map", function() {
			expect(taghash.maps.all_tags[1]).toEqual({
				tag:'tag',
				count:19,
				med_date:new Date("Sun Jan 10 2016 00:00:00 GMT-0500 (EST)")
			});
		});

		it("Should add tags of the proper format to lists of cities", function() {
			expect(taghash.maps["NewYorkCity"].city).toEqual("New York City");
			expect(taghash.maps["NewYorkCity"].tags[1]).toEqual({
				tag:"tag",
				count:19,
				med_date:new Date("Sun Jan 10 2016 00:00:00 GMT-0500 (EST)"),
				articles:articles
			});
		});

		it ("Should add cities of the proper format to list of tags", function() {
			expect(taghash.maps["tag2"].tag).toEqual("tag2");
			expect(taghash.maps["tag2"].cities[0]).toEqual({
				city:"New York City",
				count:19,
				med_date:new Date("Sun Jan 10 2016 00:00:00 GMT-0500 (EST)"),
				articles:articles
			});
			expect(taghash.maps["tag2"].cities[1]).toEqual({
				city:"Los Angeles",
				count:19,
				med_date:new Date("Sun Jan 10 2016 00:00:00 GMT-0500 (EST)"),
				articles:articles
			});
		});

		it ("Should create person-level maps of the proper format", function() {
			//TODO, I think this may require a different structure.
		})
	});

describe("dynamo_prep function", function() {
	it("format for posting in dynamodb", function() {
		var maps = {
			all:{
				stuff:"things",
				things:"stuff"
			},
			stuff:{
				stuff:"things"
			}
		};
		var taghash = new TagHash();
		expect(taghash.dynamo_prep(maps)[0]).toEqual(
		{ 
			map_name:{S:"all"},
			data:{ M: {
					stuff:"things",
					things:"stuff"
				}
			}
		});
		expect(taghash.dynamo_prep(maps)[1]).toEqual(
		{ 
			map_name:{S:"stuff"},
			data: { M: {
				stuff:"things"
				}
			}
		});
	})
})
});