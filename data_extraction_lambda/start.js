var aws = require('aws-sdk'),
Promise = require('promise');

var ec2 = new aws.EC2({apiVersion: '2015-10-01'}),
ecs = new aws.ECS(),
sns = new aws.SNS({apiVersion: '2010-03-31'});
// dynamodb = new aws.DynamoDB({apiVersion: '2015-02-02'})

module.exports.handler = function(event, context) {
    var instanceParams = {
      InstanceIds: [ 'i-eb0b645a' ],
      DryRun: false
    };

    var task = JSON.parse(event.Records[0].SNS.Message).task;

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
  //event.SNS.Records[0].Message.taskDefinition
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
}

//TODO: Move to separate function. Ideally this logic operates elsewhere.

var updateDynamo = function() {
    
  var update_messages = [
    {
      TableName:'mayorsdb_articles',
      updates:[
        {
          ReadCapacityUnits:1,
          WriteCapacityUnits:15
        },{
          index:'city-index',
          ReadCapacityUnits:5,
          WriteCapacityUnits:1
        },
        {
          index:'url-index',
          ReadCapacityUnits:4,
          WriteCapacityUnits:1
        }
      ]
    },
    {
      TableName:'mayorsdb_tag',
      updates:[
        {
          ReadCapacityUnits:1,
          WriteCapacityUnits:10
        }
      ]
    } 
  ];

  for (var i=0, i<update_messages.length, i++) {
    sns.publish({
      Message: update_messages[i],
      Subject: 'DynamoDB Update',
      TargetArn: 'STRING_VALUE',
      TopicArn: 'STRING_VALUE'
    })
  };
}