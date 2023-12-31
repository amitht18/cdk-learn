import { App, CfnOutput, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Bucket, BucketAccessControl, EventType } from 'aws-cdk-lib/aws-s3';
import { SnsDestination } from 'aws-cdk-lib/aws-s3-notifications';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { SqsSubscription } from 'aws-cdk-lib/aws-sns-subscriptions';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
export class NotifyImageUploadStack extends Stack {
    constructor(scope: App, id: string, props?: StackProps) {
        super(scope, id, props);

        const bucket = new Bucket(this, 'sns-sqs-demo-bucket', {
            bucketName: 'sns-sqs-demo-bucket',
            removalPolicy: RemovalPolicy.DESTROY,
            accessControl: BucketAccessControl.BUCKET_OWNER_FULL_CONTROL,
            autoDeleteObjects: true
        });

        const topic = new Topic(this, 'sns-sqs-demo-topic', {
            topicName: 'sns-sqs-demo-topic',
            displayName: 'sns-sqs-demo-topic'
        });

        const dest = new SnsDestination(topic);

        bucket.addEventNotification(EventType.OBJECT_CREATED, dest);

        const sqsDemoQueue = new Queue(this, 'sns-sqs-demo-queue', {
            queueName: 'sns-sqs-demo-queue',
        });

        topic.addSubscription(new SqsSubscription(sqsDemoQueue));
        
        const loggerLambda = new Function(this, 'logger-lambda', {
            runtime: Runtime.NODEJS_18_X,
            handler: 'index.handler',
            code: Code.fromAsset('./logger-lambda'),
            environment: {
                BUCKET_NAME: bucket.bucketName
            },
            functionName: 'logger-lambda'
        })

        loggerLambda.addEventSource(new SqsEventSource(sqsDemoQueue));

        sqsDemoQueue.grantSendMessages(loggerLambda);
        topic.grantPublish(loggerLambda);
        
        new CfnOutput(this, 'BucketName', {
            value: bucket.bucketName,
            exportName: 'BucketName'
        })
    }
}