'use strict';

var aws = require('aws-sdk');
var dynamodb = new aws.DynamoDB({apiVersion: '2015-02-02'});

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
    if (err) {context.fail(err);}
    else {
      if (message.updates.length===0) {
        context.succeed(data);
      } else {
        updateProvisioning(message, context);
      }
    }
  }); 
}

module.exports.handler = function(event, context) {
  var message = JSON.parse(event.Records[0].SNS.Message);
  updateProvisioning(message, context); 
};