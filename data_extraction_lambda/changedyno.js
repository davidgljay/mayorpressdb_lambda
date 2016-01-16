var aws = require('aws-sdk');
var dynamodb = new aws.DynamoDB({apiVersion: '2015-02-02'});

//TODO: Get db name and new capacities from event for flexibility.

module.exports.handler = function(event, context) {
    var dynamoUpdateParams = {
      TableName: 'mayorsdb_articles',
      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1
      }
    };
    dynamodb.updateTable(dynamoUpdateParams, function(err, data) {
      if (err) context.fail(err); // an error occurred
      else     context.succeed(data);           // successful response
    });    
}