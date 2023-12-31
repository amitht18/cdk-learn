import { App, CfnOutput, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { PolicyStatement, Effect, AnyPrincipal } from 'aws-cdk-lib/aws-iam';
import { Bucket, BlockPublicAccess, BucketAccessControl } from 'aws-cdk-lib/aws-s3';

export class S3DemoStack extends Stack {
    constructor(scope: App, id: string, props?: StackProps) {
        super(scope, id, props);

        const s3Bucket = new Bucket(this, 'DemoBucketAmith', {
            removalPolicy: RemovalPolicy.DESTROY,
            versioned: true,
            publicReadAccess: true,
            blockPublicAccess: BlockPublicAccess.BLOCK_ACLS,
            accessControl: BucketAccessControl.BUCKET_OWNER_FULL_CONTROL,
            autoDeleteObjects: true
        });

        const S3Policy = new PolicyStatement({
            principals: [new AnyPrincipal()],
            actions: ['s3:GetObject'],
            resources: [s3Bucket.bucketArn + '/*'],
            effect: Effect.ALLOW
        });
        s3Bucket.addToResourcePolicy(S3Policy);

        new CfnOutput(this, 'StaticWebsiteURL', {
            value: s3Bucket.bucketWebsiteUrl,
            exportName: 'StaticWebsiteURL',
        })
    }
}