import { App, CfnOutput, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { AttributeType, TableClass, TableV2 } from 'aws-cdk-lib/aws-dynamodb'


export class DynamodbDemoStack extends Stack {
    constructor(scope: App, id: string, props?: StackProps) {
        super(scope, id, props);
        const dynamoDBDemo = new TableV2(this, 'DynamoDBDemo', {
            tableName: 'DynamoDBDemo',
            partitionKey: {
                name: 'id',
                type: AttributeType.STRING
            },
            tableClass: TableClass.STANDARD,
            removalPolicy: RemovalPolicy.DESTROY
        })

        new CfnOutput(this, 'DynamoDBDemoArn', {
            value: dynamoDBDemo.tableArn,
            exportName: 'DynamoDBDemoArn'
        })
    }
}