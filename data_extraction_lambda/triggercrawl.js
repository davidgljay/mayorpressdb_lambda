var AWS = require('aws-sdk'),
sns = new AWS.SNS();

module.exports.handler=function(event, context) {
    var startTaskParams = {task:'mayorspressDB'},
    scaleArticlesParams = {
        tablename:'mayorsdb_articles',
        updates:[
            {
                ReadCapacityUnits:1,
                WriteCapaityUnits:15
            },
            { 
                index:'city-index',
                ReadCapacityUnits:10,
                WriteCapacityUnits:1
            },
            {
                index:'url-index',
                ReadCapacityUnits:10,
                WriteCapacityUnits:1
            }
        ],
        sns:JSON.stringify(startTaskParams)
    },
    scaleTagsParams = {
        tablename:'mayorsdb_tags',
        updates:[
                {
                    ReadCapacityUnits:20,
                    WriteCapacityUnits:20
                }
            ]
    };
    
    sns.publish({
        Message:JSON.stringify(scaleTagsParams),
        TopicArn:'arn:aws:sns:us-east-1:663987893806:mayorsdb_updatedyno'
    }, function(err, data) {
        if (err)context.fail(err);
        else {
            sns.publish(
                {
                    Message:JSON.stringify(scaleArticlesParams),
                    TopicArn:'arn:aws:sns:us-east-1:663987893806:mayorsdb_updatedyno'
                }, function(err, data) {
                    if (err) context.fail(err);
                    else context.succeed("Started mayorsdb crawl");
                })
        }
    })
}