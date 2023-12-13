#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CdkDemoStack } from '../lib/cdk-demo-stack';
import { S3DemoStack } from '../lib/s3-demo-stack';
import { S3DeployStaticAppStack } from '../lib/push-file-stack';

const env: cdk.Environment = {
  account: '512705736263',
  region: 'us-east-1'
}

const app = new cdk.App();
// new CdkDemoStack(app, 'CdkDemoStack', { env });

// new S3DemoStack(app, 'S3DemoStack', { env })

new S3DeployStaticAppStack(app, 'S3DeployStaticAppStack', { env })