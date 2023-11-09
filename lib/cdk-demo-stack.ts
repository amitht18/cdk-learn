import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { InstanceTarget } from 'aws-cdk-lib/aws-elasticloadbalancingv2-targets';

export class CdkDemoStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpcd = new ec2.Vpc(this, 'mainVpc', {
      maxAzs: 2,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'public-subnet',
          subnetType: ec2.SubnetType.PUBLIC
        }
      ]
    })

    const sGD = new ec2.SecurityGroup(this, 'mainSecurityGroup', {
      vpc: vpcd,
      description: 'mainSecurityGroup',
      securityGroupName: 'mainSecurityGroup',
    })
    sGD.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'Allow ssh');
    sGD.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'Allow HTTP');
    sGD.addEgressRule(ec2.Peer.anyIpv4(), ec2.Port.allTraffic(), 'Allow all outbound traffic');
    const role = new iam.Role(this, 'ec2InstanceRole', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('IAMReadOnlyAccess'),
      ]
    })

    const image = ec2.MachineImage.latestAmazonLinux2({
      userData: ec2.UserData.custom(`
        #!/bin/bash
        yum update -y
        yum install -y httpd
        systemctl start httpd
        systemctl enable httpd
        echo "<h1>Hello World from $(hostname -f)</h1>" > /var/www/html/index.html
      `)
    })

    const targets = [];
    for (let i = 0; i < 2; i++) {
      const ec2Instance = new ec2.Instance(this, `ec2Instance-${i}`, {
        vpc: vpcd,
        securityGroup: sGD,
        instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
        machineImage: image,
        role,
      })
      ec2Instance.instance.blockDeviceMappings = [
        {
          deviceName: '/dev/xvda',
          ebs: {
            volumeSize: 8,
            volumeType: ec2.EbsDeviceVolumeType.GP2,
            deleteOnTermination: true,
          }
        },
        {
          deviceName: '/dev/xvdb',
          ebs: {
            volumeSize: 8,
            volumeType: ec2.EbsDeviceVolumeType.GP2,
            deleteOnTermination: false,
          }
        }
      ]

      targets.push(new InstanceTarget (ec2Instance, 80))
    }

    const albSecurityGroup = new ec2.SecurityGroup(this, 'ALBSecurityGroup', {
      vpc: vpcd,
      description: 'ALBSecurityGroup',
      securityGroupName: 'ALBSecurityGroup',
    })
    albSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'Allow HTTP');

    const lb = new elbv2.ApplicationLoadBalancer(this, 'mainLoadBalancer', {
      vpc: vpcd,
      internetFacing: true,
      ipAddressType: elbv2.IpAddressType.IPV4,
      securityGroup: albSecurityGroup
    })
    const targetGroup = new elbv2.ApplicationTargetGroup(this, 'mainTargetGroup', {
      protocol: elbv2.ApplicationProtocol.HTTP,
      targets: targets,
      port: 80,
      protocolVersion: elbv2.ApplicationProtocolVersion.HTTP1,
      vpc: vpcd
    })
    lb.addListener('mainListener', {
      port: 80,
      defaultTargetGroups: [targetGroup]
    })
  }
}
