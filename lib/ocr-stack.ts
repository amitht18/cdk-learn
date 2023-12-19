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

    // S3 Bucket for image uploads
    const imageBucket = new s3.Bucket(this, 'ImageBucket', {
      removalPolicy: RemovalPolicy.DESTROY, // Only for testing, adjust as needed
    });

    // SNS Topic for OCR completion notifications
    const ocrCompletionTopic = new sns.Topic(this, 'OCRCompletionTopic');

    // Lambda function for Tesseract OCR
    const ocrLambda = new lambda.Function(this, 'OCRLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'tesseract-impl.handler',
      code: lambda.Code.fromAsset('./tesseract-ocr'), // Update this path
      environment: {
        BUCKET_NAME: imageBucket.bucketName,
        OCR_COMPLETION_TOPIC_ARN: ocrCompletionTopic.topicArn,
      },
    });

    // Grant Lambda permissions to read from S3
    imageBucket.grantRead(ocrLambda);

    // Grant Lambda permissions to publish to SNS topic
    ocrCompletionTopic.grantPublish(ocrLambda);

    // Set up S3 trigger for Lambda function
    imageBucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3Notifications.LambdaDestination(ocrLambda)
    );

    // Subscribe Lambda function to SNS topic
    ocrCompletionTopic.addSubscription(new snsSubscriptions.LambdaSubscription(ocrLambda));
  }
}