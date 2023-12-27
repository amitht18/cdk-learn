import { App, CfnOutput, Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import { Bucket, BucketAccessControl, BlockPublicAccess } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { CloudFrontWebDistribution, OriginAccessIdentity } from 'aws-cdk-lib/aws-cloudfront';

export class S3DeployStaticAppStack extends Stack {
    constructor(scope: App, id: string, props?: StackProps) {
        super(scope, id, props);

        const s3Bucket = new Bucket(this, 'S3StaticWebsiteBucket', {
            removalPolicy: RemovalPolicy.DESTROY,
            versioned: true,
            publicReadAccess: false,
            blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
            accessControl: BucketAccessControl.BUCKET_OWNER_FULL_CONTROL,
            websiteIndexDocument: 'index.html',
            websiteErrorDocument: 'index.html',
            autoDeleteObjects: true,
            bucketName: 'amith-s3-static-website',
        });

        const deployment = new BucketDeployment(this, 'DeployWebsite', {
            sources: [Source.asset('./static-site')],
            destinationBucket: s3Bucket,
        })

        const originAccessIdentity = new OriginAccessIdentity(this, 'OriginAccessIdentity', {
            comment: 'CDK Origin Access Identity',
        })
        s3Bucket.grantRead(originAccessIdentity)

        const cloudfrontDistribution = new CloudFrontWebDistribution(this, 'CloudFrontDistribution', {
            originConfigs: [
                {
                    s3OriginSource: {
                        s3BucketSource: s3Bucket,
                        originAccessIdentity: originAccessIdentity
                    },
                    behaviors: [
                        {
                            isDefaultBehavior: true
                        }
                    ],
                }
            ],
        })

        deployment.node.addDependency(s3Bucket)

        new CfnOutput(this, 'staticWebsiteCloudFrontURL', {
            value: cloudfrontDistribution.distributionDomainName,
            exportName: 'staticWebsiteCloudFrontURL',
        })
    }
}