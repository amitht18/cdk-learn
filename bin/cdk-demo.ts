#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CdkDemoStack } from '../lib/cdk-demo-stack';
import { S3DemoStack } from '../lib/s3-demo-stack';
import { S3DeployStaticAppStack } from '../lib/push-file-stack';
import { RdsDemoStack } from '../lib/rds-demo-stack';
import { DynamodbDemoStack } from '../lib/dynamodb-demo-stack';
import { TesseractOcrStack } from '../lib/ocr-stack';
import { NotifyImageUploadStack } from '../lib/notify-image-upload.stack';

const app = new cdk.App();
new CdkDemoStack(app, 'CdkDemoStack');
new S3DemoStack(app, 'S3DemoStack');
new S3DeployStaticAppStack(app, 'S3DeployStaticAppStack');
new RdsDemoStack(app, 'RdsDemoStack');
new DynamodbDemoStack(app, 'DynamodbDemoStack');
new TesseractOcrStack(app, 'TesseractOcrStack');
new NotifyImageUploadStack(app, 'NotifyImageUploadStack');