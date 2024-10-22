import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { MyAPIGatewayConstruct } from "./MyAPIGatewayConstruct";

export class APIKeyWithLambdaTestStack extends Stack {

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);
        
        const newGWY = new MyAPIGatewayConstruct(this, 'MyAPIGateway', props)
        
        new CfnOutput(this, 'APIGatewayEndpoint', {
            value: newGWY.api.restApi.url,
            exportName: 'APIGatewayEndpoint',
        })
    }
}