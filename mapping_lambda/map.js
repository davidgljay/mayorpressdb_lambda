"use strict"
//Pulls press relases and generates maps overall and by city.
//This will involve a large word freqency hashmap probably, possibly an array with mergesort.

var dynamo = require('./api/dynamo'),
TagHash = require('./taghash.js'),
s3 = require('./api/s3');

var tag_hash = new TagHash();

module.exports.handler = function(event, context) {

	scan_dynamo('')
	.then(post_results)
	.then(function() {
		context.succed('Mapping scan complete');
	}, function(err) {
		context.fail('Mapping scan error:' + err);
	});
};

//Recursively scan dynamoDB 
var scan_dynamo = function(lastkey) {
	return dynamo.scan(process.env.SCAN_DYNAMO, lastkey)
	 	.then(function(results) {
			console.log(results);
			tag_hash.parsetags(results.Items);
			if(results.lastKey!==null) {
				return scan_dynamo(lastkey);
			} else {
				return;
			}
		});
};

var post_results = function() {
	return s3.batch_post(tag_hash.hash);
};
