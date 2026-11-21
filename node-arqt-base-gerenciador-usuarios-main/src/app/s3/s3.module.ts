import { DynamicModule, Module } from '@nestjs/common';
import { AwsS3 } from './business/awsS3';
import { ConfigAws } from './interface/configAws.interface';

@Module({
  imports: [],
  controllers: [],
  providers: [AwsS3],
  exports: [AwsS3]
})
export class S3Module {
  static forRoot(configAws: ConfigAws): DynamicModule {
    const uploadS3 = new AwsS3(configAws);
    return {
      module: S3Module,
      providers: [
        {
          provide: AwsS3,
          useValue: uploadS3
        }
      ]
    }
  }
}
