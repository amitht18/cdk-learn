import { CfnOutput, Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
  Vpc,
  SubnetType,
  SecurityGroup,
  InstanceType,
  InstanceClass,
  InstanceSize,
  Port,
  Peer,
  LaunchTemplate,
  AmazonLinuxImage,
  UserData
} from 'aws-cdk-lib/aws-ec2';
import { ApplicationLoadBalancer, ApplicationProtocol, ApplicationProtocolVersion, ApplicationTargetGroup, TargetType } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { AutoScalingGroup, HealthCheck } from 'aws-cdk-lib/aws-autoscaling';

export class CdkDemoStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    const vpc = new Vpc(this, 'ALBDemoVpc', {
      maxAzs: 2,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Public',
          subnetType: SubnetType.PUBLIC
        }
      ]
    });

    const sgForEC2 = new SecurityGroup(this, 'SGForEC2', {
      vpc,
      description: 'Security Group for EC2',
    });
    sgForEC2.addIngressRule(Peer.anyIpv4(), Port.tcp(22), 'SSH Access');
    sgForEC2.addIngressRule(Peer.anyIpv4(), Port.tcp(80), 'HTTP Access');
    sgForEC2.addEgressRule(Peer.anyIpv4(), Port.allTraffic());

    const ALB = new ApplicationLoadBalancer(this, 'ALB', {
      vpc,
      internetFacing: true,
      securityGroup: sgForEC2,
      loadBalancerName: 'ALBDemo',

    });
    const targetGroup = new ApplicationTargetGroup(this, 'TargetGroup', {
      vpc,
      port: 80,
      protocol: ApplicationProtocol.HTTP,
      targetType: TargetType.INSTANCE,
      protocolVersion: ApplicationProtocolVersion.HTTP1,
    });
    ALB.addListener('ALBListener', {
      port: 80,
      defaultTargetGroups: [targetGroup],
    });

    const asg = new AutoScalingGroup(this, 'ASG', {
      vpc,
      launchTemplate: new LaunchTemplate(this, 'LaunchTemplate', {
        instanceType: InstanceType.of(InstanceClass.T2, InstanceSize.MICRO),
        machineImage: new AmazonLinuxImage(),
        securityGroup: sgForEC2,
        userData: UserData.custom(`
          #!/bin/bash
          yum update -y
          yum install httpd -y
          service httpd start
          chkconfig httpd on
          echo "<h1>Hello World from ASG Instance $(hostname -f)</h1>" > /var/www/html/index.html
        `),
      }),
      maxCapacity: 4,
      minCapacity: 2,
      desiredCapacity: 3,
      healthCheck: HealthCheck.elb({
        grace: Duration.seconds(5),
      }),
    });
    asg.attachToApplicationTargetGroup(targetGroup);
    
    new CfnOutput(this, 'VPCID', {
      value: vpc.vpcId,
      description: 'VPC ID',
    });
  }
}
