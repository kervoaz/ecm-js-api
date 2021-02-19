export const kinesisConstant = {
  STATE: {
    ACTIVE: 'ACTIVE',
    UPDATING: 'UPDATING',
    CREATING: 'CREATING',
    DELETING: 'DELETING',
  },
  STREAM_NAME: process.env.KINESIS_ENRICHED_STREAM_NAME,
  PARTITION_KEY: 'partitionkey',
  PAYLOAD_TYPE: 'String',
  REGION: 'eu-west-1',
  API_VERSION: '2013-12-02',
};
// Create the DynamoDB service object
//AWS client is created with proxy and injected through global variable
// eslint-disable-next-line @typescript-eslint/no-var-requires
export const AWS = require('aws-sdk');
AWS.config.update({ region: 'eu-west-1' });
/*if (process.env.HTTP_PROXY !== undefined && process.env.HTTP_PROXY !== null) {
  Logger.warn(`proxy has been set for AWS SDK`);
  const proxy = require('proxy-agent');
  AWS.config.update({
    httpOptions: {
      agent: proxy(process.env.HTTP_PROXY),
      rejectUnauthorized: false,
    },
  });
}*/
export const S3 = new AWS.S3();
export const dynamoDb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });
export const docClient = new AWS.DynamoDB.DocumentClient();

export const kinesis = new AWS.Kinesis({
  apiVersion: kinesisConstant.API_VERSION, //optional
  //accessKeyId: '<you-can-use-this-to-run-it-locally>', //optional
  //secretAccessKey: '<you-can-use-this-to-run-it-locally>', //optional
  region: kinesisConstant.REGION,
});
export const cloudwatchlogs = new AWS.CloudWatchLogs({
  apiVersion: '2014-03-28',
});
export const cloudwatch = new AWS.CloudWatch({ apiVersion: '2010-08-01' });

export const secretsManager = new AWS.SecretsManager({
  apiVersion: '2017-10-17',
});

export const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });
export const lambda = new AWS.Lambda({ apiVersion: '2015-03-31' });

export const textract = new AWS.Textract({ apiVersion: '2018-06-27' });
