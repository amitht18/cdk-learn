import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as S3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';


export class S3DeployStaticAppStack extends cdk.Stack {
    constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const s3Bucket = new S3.Bucket(this, 'DemoBucketAmith', {
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            versioned: true,
            publicReadAccess: true,
            blockPublicAccess: S3.BlockPublicAccess.BLOCK_ACLS,
            accessControl: S3.BucketAccessControl.BUCKET_OWNER_FULL_CONTROL,
            websiteIndexDocument: 'index.html',
            websiteErrorDocument: 'index.html'
        });

        const S3Policy = new iam.PolicyStatement({
            principals: [new iam.AnyPrincipal()],
            actions: ['s3:GetObject'],
            resources: [s3Bucket.bucketArn + '/*'],
            effect: iam.Effect.ALLOW
        });
        s3Bucket.addToResourcePolicy(S3Policy);
        s3Bucket.isWebsite

        new s3deploy.BucketDeployment(this, 'DeployWebsite', {
            sources: [s3deploy.Source.asset('./static-site')],
            destinationBucket: s3Bucket
        })
    }
}