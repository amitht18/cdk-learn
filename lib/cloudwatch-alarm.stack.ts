import { Stack, App, StackProps, Duration, CfnOutput } from "aws-cdk-lib";
import { Metric } from "aws-cdk-lib/aws-cloudwatch";
import { Ec2InstanceAction } from "aws-cdk-lib/aws-cloudwatch-actions";
import { AmazonLinuxImage, Instance, InstanceClass, InstanceSize, InstanceType, SubnetType, Vpc } from "aws-cdk-lib/aws-ec2";

export class CloudwatchAlarmStack extends Stack {
    constructor(scope: App, id: string, props?: StackProps) {
        super(scope, id, props);

        const billingMetric = new Metric({
            namespace: 'AWS/Billing',
            metricName: 'EstimatedCharges',
            statistic: 'Maximum',
            period: Duration.minutes(5),
            dimensionsMap: {
                Currency: 'USD'
            }
        });

        billingMetric.createAlarm(this, 'BillingAlarm', {
            threshold: 0,
            evaluationPeriods: 1,
            alarmName: 'BillingAlarm',
        });

        const vpc = new Vpc(this, 'CloudWatchDemoVPC', {
            maxAzs: 2,
            vpcName: 'cloud-watch-demo-vpc',
            subnetConfiguration: [
                {
                    name: 'Public',
                    cidrMask: 24,
                    subnetType: SubnetType.PUBLIC
                }
            ]
        })

        const ec2Instance = new Instance(this, 'cloudWatchAlarmDemo', {
            instanceType: InstanceType.of(InstanceClass.T2, InstanceSize.MICRO),
            machineImage: new AmazonLinuxImage(),
            instanceName: 'cloudWatchAlarmDemo',
            vpc,
        })

        const ec2RecoverMetric = new Metric({
            metricName: 'ec2-recovery-metric',
            namespace: 'AWS/EC2',
        })

        ec2RecoverMetric.attachTo(ec2Instance)
        const ec2Alarmed = ec2RecoverMetric.createAlarm(this, 'demoEC2RecoverAlarm', {
            alarmName: 'ec2RecoverAlarm',
            evaluationPeriods: 2,
            threshold: 0,
            actionsEnabled: true,
        })

        // find way to attach Alarm to instance

        new CfnOutput(this, 'BillingAlarmArn', {
            value: billingMetric.metricName,
            exportName: 'metricName'
        });
    }
}