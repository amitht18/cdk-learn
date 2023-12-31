import { RemovalPolicy, Stack, StackProps }from 'aws-cdk-lib/core';
import { Function, Code, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Bucket, EventType } from 'aws-cdk-lib/aws-s3';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { LambdaSubscription } from 'aws-cdk-lib/aws-sns-subscriptions';
import { LambdaDestination }  from 'aws-cdk-lib/aws-s3-notifications';
import { Construct } from 'constructs';

export class TesseractOcrStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const imageBucket = new Bucket(this, 'ImageBucket', {
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const ocrCompletionTopic = new Topic(this, 'OCRCompletionTopic');

    const ocrLambda = new Function(this, 'OCRLambda', {
      runtime: Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: Code.fromAsset('./tesseract-ocr'),
      environment: {
        BUCKET_NAME: imageBucket.bucketName,
        OCR_COMPLETION_TOPIC_ARN: ocrCompletionTopic.topicArn,
      },
    });

    imageBucket.grantRead(ocrLambda);
    ocrCompletionTopic.grantPublish(ocrLambda);

    imageBucket.addEventNotification(
      EventType.OBJECT_CREATED,
      new LambdaDestination(ocrLambda)
    );
    ocrCompletionTopic.addSubscription(new LambdaSubscription(ocrLambda));
  }
}