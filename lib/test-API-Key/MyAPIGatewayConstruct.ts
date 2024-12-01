import { StackProps } from "aws-cdk-lib";
import { ApiKey, LambdaRestApi, RestApi, Stage, UsagePlan } from "aws-cdk-lib/aws-apigateway";
import { ApiGateway } from "aws-cdk-lib/aws-events-targets";
import { Construct } from "constructs";
import { MyLambdaConstruct } from "./MyLambdaConstuct";

export class MyAPIGatewayConstruct extends Construct {
    public readonly api: ApiGateway;
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id);

        const restAPI = new LambdaRestApi(this, 'MyAPIGateway', {
            handler: new MyLambdaConstruct(this, 'MyAPIGatewayLambda').function,
            proxy: false
        })
        restAPI.root.addResource('test-one')
        restAPI.root.addMethod('GET')
        const apiKey = new ApiKey(this, 'MyAPIKey',{
            apiKeyName: 'MyAPIKey',
            value: 'hellowAmithSayHiToWorld'
        })

        const usagePlans = new UsagePlan(this, 'testAPIKeys2', {
            name: 'testAPIKeys2',
        })
        usagePlans.addApiStage({ stage: restAPI.deploymentStage, api: restAPI })
        restAPI.addApiKey('MyAPIKey')

        this.api = new ApiGateway(restAPI)
    }
}