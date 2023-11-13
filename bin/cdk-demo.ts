#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CdkDemoStack } from '../lib/cdk-demo-stack';
import { S3DemoStack } from '../lib/s3-demo-stack';

const app = new cdk.App();
new CdkDemoStack(app, 'CdkDemoStack', {
  env: {
    account: '512705736263',
    region: 'us-east-1'
  }
});

new S3DemoStack(app, 'S3DemoStack', {
  env: {
    account: '512705736263',
    region: 'us-east-1'
  }
})