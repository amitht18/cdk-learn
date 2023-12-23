import { RemovalPolicy, Stack, StackProps }from 'aws-cdk-lib/core';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as snsSubscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import * as s3Notifications from 'aws-cdk-lib/aws-s3-notifications';
import { Construct } from 'constructs';

export class TesseractOcrStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const imageBucket = new s3.Bucket(this, 'ImageBucket', {
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const ocrCompletionTopic = new sns.Topic(this, 'OCRCompletionTopic');

    const ocrLambda = new lambda.Function(this, 'OCRLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('./tesseract-ocr'),
      environment: {
        BUCKET_NAME: imageBucket.bucketName,
        OCR_COMPLETION_TOPIC_ARN: ocrCompletionTopic.topicArn,
      },
    });

    imageBucket.grantRead(ocrLambda);
    ocrCompletionTopic.grantPublish(ocrLambda);

    imageBucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3Notifications.LambdaDestination(ocrLambda)
    );
    ocrCompletionTopic.addSubscription(new snsSubscriptions.LambdaSubscription(ocrLambda));
  }
}