'use strict';

var NounProject = require('the-noun-project'),
https=require('https'),
AWS = require('aws-sdk'),
Promise = require('promise');

var dynamodb = new AWS.DynamoDB({apiVersion: '2015-02-02'}),
s3 = new AWS.S3();

var handler = exports.handler = function(event, context) {

	var promise_chain = new Promise(function(resolve) {resolve();});

	for (var i=0; i<event.Records.length; i++) {
		console.log(i);
		//Add promises to get each icon, upload it to S3 and update DynamoDB
		promise_chain = promise_chain.then(getAndPostIcon(event, i));
	}

	promise_chain.then(
		function() {
			context.succeed("Icons added to all tags.")
		},
		function(err) {
			context.fail(err)
		});
};

function getAndPostIcon (event, i) {
	return function() {
		var tag = event.Records[i].mayorsdb_tags.NewImage.tag.S;

		//Only get a icon if one has not already been added
		if (!event.Records[i].mayorsdb_tags.NewImage.icon_attrib) {
			return getIcon(tag)
			.then(function(icon) {
				return Promise.all([
						updateS3(icon, tag),
						updateDynamoDB(icon, tag)
					])
			});
		} else {
			console.log("Skipping " + tag);
			return
		}

	}

}

function getIcon (tag) {
	return new Promise(function(resolve,reject) {
		new NounProject({
		    key: '69f2ae6f165049fe959bf330349cb492',
		    secret: '6077fd6d8cfc4e4b9a69db519ac56b28'
		}).getIconsByTerm(tag, {limit: 1}, function (err, data) {
		    if (err) { 
		    	reject("Error Contacting Noun Project", err)
		    }
		    else {	
		    	resolve(data.icons[0], tag);
		    }
		});

	})
};

function updateS3 (icon, tag) {
	return new Promise(function(resolve,reject) {
		https.get(icon.preview_url_84, function(res) {
	         var params = {
				Bucket: 'mayors.buzz',
				Key: 'images/icons/' + tag.replace(/[^a-z0-9]/ig,"_") + '.png', 
				ACL:'public-read',
				Body: res
			};
		
			s3.upload(params, function(err, data) {
				if (err) reject("Error updating S3:\n" + err);
				else resolve(data);
			});   
    	});
	});
};

function updateDynamoDB (icon, tag) {
	return new Promise(function(resolve, reject) {
		setInterval(function() {
			dynamodb.updateItem({
				TableName:'mayorsdb_tags',
				Key:{tag:{S:tag}},
				ReturnValues:'NONE',
				ReturnItemCollectionMetrics:'NONE',
				ReturnConsumedCapacity: 'NONE',
				ExpressionAttributeValues: {':attrib':{S:icon.attribution}},
				UpdateExpression: 'SET icon_attrib=:attrib'
			},function(err, data) {
				if (err) reject("Error updating DynamoDB:\n" + err);
				else resolve(data);
			});			
		},100);
	})
}
