# pulumi-aws-staticsite-builder
![npm (scoped)](https://img.shields.io/npm/v/@k_higuchi/pulumi-aws-staticsite-builder.svg?color=blue)
![node](https://img.shields.io/node/v/@k_higuchi/pulumi-aws-staticsite-builder.svg?color=green)
![GitHub](https://img.shields.io/github/license/k-higuchi0440/pulumi-aws-staticsite-builder.svg?color=blue)

## Q. what is (Static Website) Builder?
**Builder** enables you to override **ANY** values and to create resources **WHENEVER** you want.
 
 ### example
```TSX
// initialize with required values and default values. NOTE: any resources are NOT created yet
const builder = new CustomDomainWebsiteBuilder(bucketName, domainNames, certificateARN)

builder.distributionPartialArgs.priceClass = "PriceClass_All" // with the builder, you can set your value easily!

builder.bucketPartialArgs.website = {
    indexDocument: "index.html",
    errorDocument: "error.html"  // if you don't like default document name "404.html", replace it like this!
}

export const website: StaticWebsite = builder.build("website-example") // this is when resources are created!
```

Builder property has type. so you can use code completion!
![website_builder_demo](https://user-images.githubusercontent.com/30319578/61168316-4b0fb780-a587-11e9-89ef-2a1f56894629.gif)

after you created a website, you can update ANY value. (this is good in terms of extensibility. **it means THE reusable!**)

**NOTE: of cource, resources are enough configured. so you don't have to set any values.**  

## Resource Hierarchy
- StaticWebsite (root)
    - S3
        - Bucket
        - BucketPolicy
    - Cloudfront
        - OriginAccessIdentity
        - Distribution

## Q. why need BucketPolicy and OriginAccessIdentity?
by default, S3 bucket ACL is "private" and only Cloudfront can access root document "index.html". so they are neeeded.

if this is too strict, you can set "public".
```TSX
builder.bucketPartialArgs.acl = "public"
```
(in this case, BucketPolicy and OriginAccessIdentity is not needed but will be created. but you don't have to care too much)  

## Q. Custom Domain is needed?
No. you have a choice; set domain names or not.   
there are 2 builders: `DefaultDomainWebsiteBuilder` and `CustomDomainWebsiteBuilder`
```TSX
const defaultDomain = new DefaultDomainWebsiteBuilder(bucketName) // custom domain is NOT needed

const customDomain = new CustomDomainWebsiteBuilder(bucketName, domainNames, certificateARN)
```

**I recommend you use `DefaultDomainWebsiteBuilder` in staging environment**, because you don't have to set CNAME record to your DNS records!  
    
## Q. why don't create ACM certificate?
that is because separation of concern. DNS settings depends on you and there are many ways to create ACM.  
moreover, ACM validation may take much time. creation would be really slow if certificate is created at the same time. 
    
    
## Q. what is ParitalArgs?
it is an important trick I made. 

for example, `aws.cloudfront.Distribution` takes `aws.cloudfront.DistributionArgs`. and, there is `DistributionPartialArgs`.  
it has the same properties of `aws.cloudfront.DistributionArgs` but **ANYTHING is optional**  (that's why "Partial").

`Builder` has `DistributionParitlaArgs` and merge it to original Args: `aws.cloudfront.DistributionArgs`.  
it enables you to set "parital" ones of `aws.cloudfront.DistributionArgs` like below.  

```TSX
builder.distributionPartialArgs.enabled = true,
```

(if I use `aws.cloudfront.DistributionArgs` rather than `DistributionParitlaArgs`, I can't do this because it has required properties and all of properties are readonly! I can't set ANY value and have to set required values...)

## Supplement: Q. why Builder ?
 
### A. less boilerplate, more reusable!

#### boilerplate: many input parameters to make our components reusable or your own code.

imagine this situation;  
you found a custom resource which apparently meet your requirement. but later, you found that it doesn't provide enough parameters which you need. in the end, you can't use the component and have no choice but to write your own code! the code would be a boilerplate(\*sigh\*).   

on the other hand, it is always painful for us to write many parameters and it would be also boilerplate code. 

**the Builder is a solution for the problem!**  

you can set ANY values with the builder. so you don't have to give up and we don't have to provide a tons of parameters! (only required parameters, this makes our code more readable!)

### A. Builder would boost pulumi ecosystem! (I think)
of course, this builder is only for a static website. but this pattern is applicable for any other components, I think.  
morevoer I hope this kind of pattern gets more popular because with it, we can use more and more custom resources written by others and at the same time we can provide very reusable component easily and faster. in the end, there is no boilerplate at all!

(there was some problems to create the Builder but TypeScript's "Mapped Type" makes it possible!)
