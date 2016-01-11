var aws = require('aws-sdk');
var ec2 = new aws.EC2({apiVersion: '2015-10-01'});
var dynamodb = new aws.DynamoDB({apiVersion: '2015-02-02'});

module.exports.handler = function(event, context) {
    console.log("Triggered with event: ");
    console.log(event.Records[0].Sns.Message);
    var message = JSON.parse(event.Records[0].Sns.Message)
    if (message.AlarmName == "MayorsDB_Notif") {
        console.log("Stopping EC2 instance");
        var instanceParams = {
          InstanceIds: [ 'i-eb0b645a' ],
          DryRun: false
        };
        ec2.stopInstances(instanceParams, function(err, data) {
            if (err) {
                context.fail(err);
            } else {
                context.succeed(data);
            }
        });
        updateDynamo();
    } else {
        context.succeed();
    }
};

var updateDynamo = function() {
    var dynamoUpdateParams = {
      TableName: 'mayorsdb_articles',
      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1
      }
    };
    dynamodb.updateTable(dynamoUpdateParams, function(err, data) {
      if (err) console.log(err, err.stack); // an error occurred
      else     console.log(data);           // successful response
    });
}