import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import { addPrefix } from './utility';
import { partialargs } from "./PartialArgs"

export { partialargs } from './PartialArgs';

export { DefaultDomainWebsiteBuilder } from './builders/DefaultDomainWebsiteBuilder';
export { CustomDomainWebsiteBuilder } from './builders/CustomDomainWebsiteBuilder';

export interface StaticWebsiteArgs {
  bucketPatialArgs: partialargs.s3.BucketPartialArgs
  distributionPartialArgs: partialargs.cloudfront.DistributionPartialArgs
}

const typeName = addPrefix("StaticWebsite")

export class StaticWebsite extends pulumi.ComponentResource {
  readonly bucket: aws.s3.Bucket
  readonly originAccessIdentity: aws.cloudfront.OriginAccessIdentity
  readonly bucketPolicy: aws.s3.BucketPolicy
  readonly cloudfront: aws.cloudfront.Distribution

  constructor(name: string, bucketName: string, args: StaticWebsiteArgs, opts?: pulumi.ResourceOptions) {
    const inputs: pulumi.Inputs = {
      options: opts,
    };
    super(typeName, name, inputs, opts);

    const defaultResourceOptions: pulumi.ResourceOptions = { parent: this };

    const defaultBucketArgs = createDefaultBucketArgs(bucketName)
    const bucketArgs = Object.assign(defaultBucketArgs, args.bucketPatialArgs)
    this.bucket = new aws.s3.Bucket(addPrefix(bucketName), bucketArgs, defaultResourceOptions)

    this.originAccessIdentity = new aws.cloudfront.OriginAccessIdentity(addPrefix(`${bucketName}-access-identity`), {}, defaultResourceOptions)

    const defaultBucketPolicyArgs = createDefaultBucketPolicyArgs(this.bucket)(this.originAccessIdentity)
    this.bucketPolicy = new aws.s3.BucketPolicy(addPrefix(`${bucketName}-policy`), defaultBucketPolicyArgs, defaultResourceOptions)

    const defaultDistArgs = createDefaultDistributionArgs(this.bucket)(this.originAccessIdentity)
    const distArgs = Object.assign(defaultDistArgs, args.distributionPartialArgs)
    this.cloudfront = new aws.cloudfront.Distribution(addPrefix(`${bucketName}-cdn`), distArgs, defaultResourceOptions)
  }
}

const createDefaultBucketArgs = (bucketName: string): aws.s3.BucketArgs => {
  return {
    bucket: bucketName,
    acl: "private",
    website: {
      indexDocument: "index.html",
      errorDocument: "404.html"
    }
  }
}

const createDefaultBucketPolicyArgs = (bucket: aws.s3.Bucket) => (originAccessIdentity: aws.cloudfront.OriginAccessIdentity): aws.s3.BucketPolicyArgs => {
  const policyJson = {
    Version: "2012-10-17",
    Statement: [
      {
        Sid: "PublicReadForGetBucketObjects",
        Effect: "Allow",
        Action: "s3:GetObject",
        Resource: `${bucket.arn}/*`,
        Principal: { AWS: originAccessIdentity.iamArn }
      }
    ]
  };

  return {
    bucket: bucket.id,
    policy: JSON.stringify(policyJson)
  }
}

const createDefaultDistributionArgs = (bucket: aws.s3.Bucket) => (originAccessIdentity: aws.cloudfront.OriginAccessIdentity): aws.cloudfront.DistributionArgs => {
  return {
    enabled: true,
    isIpv6Enabled: true,
    priceClass: "PriceClass_200",
    defaultRootObject: "index.html",
    origins: [
      {
        originId: bucket.id,
        domainName: bucket.bucketRegionalDomainName,
        s3OriginConfig: {
          originAccessIdentity: originAccessIdentity.cloudfrontAccessIdentityPath
        }
      }
    ],
    defaultCacheBehavior: {
      targetOriginId: bucket.id,
      allowedMethods: ["GET", "HEAD"],
      cachedMethods: ["GET", "HEAD"],
      compress: true,
      minTtl: 1,
      maxTtl: 1,
      defaultTtl: 1,
      viewerProtocolPolicy: "redirect-to-https",
      forwardedValues: {
        queryString: false,
        cookies: {
          forward: "none"
        }
      }
    },
    restrictions: {
      geoRestriction: {
        restrictionType: "none"
      }
    },
    viewerCertificate: {
      cloudfrontDefaultCertificate: true
    }
  }
}
