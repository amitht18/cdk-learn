import { StackProps } from "aws-cdk-lib";
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import path from "path";

export class MyLambdaConstruct extends Construct {
    public readonly function: Function;

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id);

        this.function = new Function(this, 'MyAPIKeyLambda', {
            runtime: Runtime.NODEJS_18_X,
            code: Code.fromAsset(path.join(__dirname, 'lambda')),
            handler: 'index.handler',
        })
    }
}