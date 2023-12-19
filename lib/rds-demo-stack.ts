import { App, Stack, StackProps, RemovalPolicy, Duration, CfnOutput } from 'aws-cdk-lib';
import { DatabaseInstance, DatabaseInstanceEngine, Credentials } from 'aws-cdk-lib/aws-rds';
import { Vpc, InstanceType, InstanceClass, SecurityGroup, InstanceSize, Peer, Port, SubnetType } from 'aws-cdk-lib/aws-ec2';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';

export class RdsDemoStack extends Stack {
    constructor(scope: App, id: string, props?: StackProps) {
        super(scope, id, props);

        const vpc = new Vpc(this, 'rdsVPC', {
            maxAzs: 2,
            subnetConfiguration: [
                {
                    cidrMask: 24,
                    name: 'Public',
                    subnetType: SubnetType.PUBLIC
                }
            ]
        })

        const rdsSG = new SecurityGroup(this, 'rdsSG', {
            vpc,
            description: 'Security Group for RDS',
        })
        rdsSG.addIngressRule(Peer.anyIpv4(), Port.tcp(5432), 'RDS Access');
        
        const engine = DatabaseInstanceEngine.MYSQL;

        const masterUserSecret = new Secret(this, 'MasterUserSecret', {
            secretName: 'master-user',
            generateSecretString: {
                generateStringKey: 'password',
                secretStringTemplate: JSON.stringify({ username: 'admin' }),
                passwordLength: 16,
                excludePunctuation: true,
            }
        })

        const rdsInstance = new DatabaseInstance(this, 'DemoRDSInstance', {
            engine,
            instanceType: InstanceType.of(InstanceClass.T2, InstanceSize.MICRO),
            credentials: Credentials.fromSecret(masterUserSecret),
            port: 3306,
            securityGroups: [rdsSG],
            vpc,
            vpcSubnets: {
                subnetType: SubnetType.PUBLIC
            },
            databaseName: 'firstDemoDB',
            backupRetention: Duration.days(0),
            deleteAutomatedBackups: true,
            removalPolicy: RemovalPolicy.DESTROY
        })

        new CfnOutput(this, 'RDSInstanceEndpoint', {
            value: rdsInstance.instanceEndpoint.socketAddress,
            exportName: 'RDSEndpoint'
        })
    }
} 
 