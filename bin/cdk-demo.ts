#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import * as AWS from 'aws-sdk';
import { CdkDemoStack } from '../lib/cdk-demo-stack';
import { S3DemoStack } from '../lib/s3-demo-stack';
import { S3DeployStaticAppStack } from '../lib/push-file-stack';
import { RdsDemoStack } from '../lib/rds-demo-stack';
import { DynamodbDemoStack } from '../lib/dynamodb-demo-stack';
import { TesseractOcrStack } from '../lib/ocr-stack';

let env: cdk.Environment = {
}

const getAWSAccountId = async (): Promise<string> => {
  const response = await new AWS.STS().getCallerIdentity().promise();
  console.log(`AWS Account ID: ${response.Account}`);
  return String(response);
};

getAWSAccountId().then((response) => {
  env = {
    account: response,
    region: 'us-east-1'
  }
})

const app = new cdk.App();
new CdkDemoStack(app, 'CdkDemoStack', { env });
new S3DemoStack(app, 'S3DemoStack', { env })
new S3DeployStaticAppStack(app, 'S3DeployStaticAppStack', { env })
new RdsDemoStack(app, 'RdsDemoStack', { env })
new DynamodbDemoStack(app, 'DynamodbDemoStack', { env })
new TesseractOcrStack(app, 'TesseractOcrStack', { env });