import * as aws from "@pulumi/aws";
import { partialargs } from "../PartialArgs";
import { StaticWebsite, StaticWebsiteArgs } from './../index';

export class CustomDomainWebsiteBuilder {
    bucketPartialArgs: partialargs.s3.BucketPartialArgs
    distributionPartialArgs: partialargs.cloudfront.DistributionPartialArgs

    readonly bucketName: string
    readonly domains: Array<string>
    readonly acmCertificateARN: string

    constructor(bucketName: string, domains: Array<string>, acmCertificateARN: string) {
        this.bucketName = bucketName
        this.domains = domains
        this.acmCertificateARN = acmCertificateARN
        this.bucketPartialArgs = {}
        this.distributionPartialArgs = {}
    }

    build(resourceName: string) {
        const customEndpointArgs = createCustomEndpointArgs(this.domains)(this.acmCertificateARN)
        const mergedDistPartialArgs = Object.assign(this.distributionPartialArgs, customEndpointArgs)

        const args: StaticWebsiteArgs = {
            bucketPatialArgs: this.bucketPartialArgs,
            distributionPartialArgs: mergedDistPartialArgs
        }
        return new StaticWebsite(resourceName, this.bucketName, args)
    }

}

const createCustomEndpointArgs = (domains: Array<string>) => (acmCertificateARN: string) => (args: aws.cloudfront.DistributionArgs): partialargs.cloudfront.DistributionPartialArgs => {
    return Object.assign(args, {
        aliases: domains,
        viewerCertificate: {
            acmCertificateArn: acmCertificateARN,
            sslSupportMethod: "sni-only",
            minimumProtocolVersion: "TLSv1"
        }
    })
}
