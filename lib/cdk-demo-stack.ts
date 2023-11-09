import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as autoscaling from 'aws-cdk-lib/aws-autoscaling';
import { InstanceTarget } from 'aws-cdk-lib/aws-elasticloadbalancingv2-targets';

export class CdkDemoStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const vpc = new ec2.Vpc(this, 'ALBDemoVpc', {
      maxAzs: 2,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC
        }
      ]
    });

    const sgForEC2 = new ec2.SecurityGroup(this, 'SGForEC2', {
      vpc,
      description: 'Security Group for EC2',
    });
    sgForEC2.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'SSH Access');
    sgForEC2.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'HTTP Access');
    sgForEC2.addEgressRule(ec2.Peer.anyIpv4(), ec2.Port.allTraffic());
    
    const EC2Targets = []
    for(let i = 0; i < 2; i++) {
      const ec2Instance = new ec2.Instance(this, `EC2Instance${i+1}`, {
        vpc,
        instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
        machineImage: new ec2.AmazonLinuxImage(),
        securityGroup: sgForEC2,
      });
      ec2Instance.addUserData(`
        #!/bin/bash
        yum update -y
        yum install httpd -y
        service httpd start
        chkconfig httpd on
        echo "<h1>Hello World from EC2 Instance ${i+1} $(hostname -f)</h1>" > /var/www/html/index.html
      `);
      EC2Targets.push(new InstanceTarget(ec2Instance));
    }

    const ALB = new elbv2.ApplicationLoadBalancer(this, 'ALB', {
      vpc,
      internetFacing: true,
      securityGroup: sgForEC2,
      loadBalancerName: 'ALBDemo',

    });
    const targetGroup = new elbv2.ApplicationTargetGroup(this, 'TargetGroup', {
      vpc,
      port: 80,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targetType: elbv2.TargetType.INSTANCE,
      targets: EC2Targets,
      protocolVersion: elbv2.ApplicationProtocolVersion.HTTP1,
    });
    ALB.addListener('ALBListener', {
      port: 80,
      defaultTargetGroups: [targetGroup],
    })
  }
}
