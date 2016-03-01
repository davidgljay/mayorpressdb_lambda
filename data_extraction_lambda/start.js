var aws = require('aws-sdk');

var ec2 = new aws.EC2({apiVersion: '2015-10-01'}),
ecs = new aws.ECS(),
sns = new aws.SNS({apiVersion: '2010-03-31'});
// dynamodb = new aws.DynamoDB({apiVersion: '2015-02-02'})

module.exports.handler = function(event, context) {
    var instanceParams = {
      InstanceIds: [ 'i-eb0b645a' ],
      DryRun: false
    };

    var task = JSON.parse(event.Records[0].Sns.Message).task;
    console.log("Starting task:" + task);

    //Start the instance if it's not already running.
    ec2.startInstances(instanceParams, function(err, data) {
        if (err) context.fail(err);
        else ec2.waitFor('instanceRunning', instanceParams, function(err, data) {
            if (err) context.fail(err);
            else runTask(task,context);
        });       
    });

};

var runTask = function(task, context) {
    var ContainerParams = {
      taskDefinition: task,
      cluster: 'mayorsdb',
      count: 1
    };
    ecs.runTask(ContainerParams, function(err, data) {
      if (err) context.fail(err);
      else if (data.failures) setTimeout(runTask(task, context), 250);
      else context.succeed("Successfully started task " + task + "\n" + JSON.stringify(data));
  });
};