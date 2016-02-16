var aws = require('aws-sdk');
var ec2 = new aws.EC2({apiVersion: '2015-10-01'});
var dynamodb = new aws.DynamoDB({apiVersion: '2015-02-02'});

module.exports.handler = function(event, context) {
    var message = JSON.parse(event.Records[0].Sns.Message)
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
};