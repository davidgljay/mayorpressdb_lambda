'use strict';

var aws = require('aws-sdk'),
dynamodb = new aws.DynamoDB({apiVersion: '2015-02-02'}),
sns = new aws.SNS();

//TODO: Get db name and new capacities from event for flexibility.
/* Accepts an SNS event with the following data scructure:
{
  tabeName:sometable,
  updates:[
    {
      index:someindex,
      ReadCapacityUnits:#,
      WriteCapacityUnits:#
    },
    {
      ReadCapacityUnits:#,
      WriteCapacityUnits:#
    }
  ]
}
*/

function updateProvisioning(message, context) {
  var update = message.updates.pop(),
  dynamoUpdateParams;


  //If an index is defined, update that index
  if (update.index) {
    dynamoUpdateParams = {
      TableName: message.tablename,
      GlobalSecondaryIndexUpdates: [
        { 
          Update: {
            IndexName: update.index,
            ProvisionedThroughput: {
              ReadCapacityUnits: update.ReadCapacityUnits,
              WriteCapacityUnits: update.WriteCapacityUnits
            }
          }
        }
      ]
    };
  }
  //Otherwise, update the overall table
  else {
    dynamoUpdateParams = {
      TableName: message.tablename,
      ProvisionedThroughput: {
        ReadCapacityUnits: update.ReadCapacityUnits,
        WriteCapacityUnits: update.WriteCapacityUnits
      }
    };
  }

  //Perform the update
  dynamodb.updateTable(dynamoUpdateParams, function(err, data) {
    if (err) console.error(err);
    if (message.updates.length===0) {
         //Optionally send an SNS message once the updates are complete.
        if (message.sns) {
            sendSns(message.sns, context)
        } else {
            context.succeed(data);
        }
    } else {
        updateProvisioning(message, context);
    }
  }); 
}

function sendSns(snsMsg, context) {
    sns.publish(snsMsg, function(err, data) {
        if (err) context.fail(err);
        else context.succeed('Updated dynamo and sent message');
    })
}

module.exports.handler = function(event, context) {
  var message = JSON.parse(event.Records[0].Sns.Message);
  updateProvisioning(message, context); 
};