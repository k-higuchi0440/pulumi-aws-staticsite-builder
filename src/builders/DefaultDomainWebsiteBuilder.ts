import { partialargs } from "../PartialArgs";
import { StaticWebsite, StaticWebsiteArgs } from './../index';

export class DefaultDomainWebsiteBuilder {
    bucketPartialArgs: partialargs.s3.BucketPartialArgs
    distributionPartialArgs: partialargs.cloudfront.DistributionPartialArgs

    readonly bucketName: string

    constructor(bucketName: string) {
        this.bucketName = bucketName
        this.bucketPartialArgs = {}
        this.distributionPartialArgs = {}
    }

    build(resourceName: string) {
        const args: StaticWebsiteArgs = {
            bucketPatialArgs: this.bucketPartialArgs,
            distributionPartialArgs: this.bucketPartialArgs
        }
        return new StaticWebsite(resourceName, this.bucketName, args)
    }

}
