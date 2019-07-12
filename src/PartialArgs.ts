import * as aws from "@pulumi/aws";

type RecursivePartial<T> = {
  -readonly [P in keyof T]?:
  T[P] extends (infer U)[] ? RecursivePartial<U>[] :
  T[P] extends object | undefined ? RecursivePartial<T[P]> :
  T[P];
};

export module partialargs {

  export module s3 {
    export type BucketPartialArgs = RecursivePartial<aws.s3.BucketArgs>
  }

  export module cloudfront {
    export type DistributionPartialArgs = RecursivePartial<aws.cloudfront.DistributionArgs>
  }

}
