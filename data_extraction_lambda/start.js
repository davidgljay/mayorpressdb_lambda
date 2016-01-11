var aws = require('aws-sdk');

var ec2 = new aws.EC2({apiVersion: '2015-10-01'});
var ecs = new aws.ECS();
var dynamodb = new aws.DynamoDB({apiVersion: '2015-02-02'})

module.exports.handler = function(event, context) {
    var instanceParams = {
      InstanceIds: [ 'i-eb0b645a' ],
      DryRun: false
    };
    ec2.startInstances(instanceParams, function(err, data) {
        if (err) context.fail(err);
    })
    
    updateDynamo(function(err, data) {
        if (err && err.code!="ValidationException") context.fail(err);
        else ec2.waitFor('instanceRunning', instanceParams, function(err, data) {
            if (err) context.fail(err);
            else runTask(context);
        });       
    });
};

var runTask = function(context) {
    var ContainerParams = {
      taskDefinition: 'mayorpressdb',
      cluster: 'mayorsdb',
      count: 1
    };
    ecs.runTask(ContainerParams, function(err, data) {
      if (err) context.fail(err);
      else if (data.failures) setTimeout(runTask(), 250);
      else context.succeed("Successfully started task\n" + JSON.stringify(data));
  });
}

var updateDynamo = function(callback) {
    var dynamoUpdateParams = {
      TableName: 'mayorsdb_articles',
      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 10
      }
    };
    dynamodb.updateTable(dynamoUpdateParams, callback);
}