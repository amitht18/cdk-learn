import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as S3 from 'aws-cdk-lib/aws-s3';


export class S3DemoStack extends cdk.Stack {
    constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const s3Bucket = new S3.Bucket(this, 'DemoBucketAmith', {
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            versioned: true,
            publicReadAccess: true,
            blockPublicAccess: S3.BlockPublicAccess.BLOCK_ACLS,
            accessControl: S3.BucketAccessControl.BUCKET_OWNER_FULL_CONTROL,
            autoDeleteObjects: true
        });

        const S3Policy = new iam.PolicyStatement({
            principals: [new iam.AnyPrincipal()],
            actions: ['s3:GetObject'],
            resources: [s3Bucket.bucketArn + '/*'],
            effect: iam.Effect.ALLOW
        });
        s3Bucket.addToResourcePolicy(S3Policy);

        new cdk.CfnOutput(this, 'StaticWebsiteURL', {
            value: s3Bucket.bucketWebsiteUrl,
            exportName: 'StaticWebsiteURL',
        })
    }
}