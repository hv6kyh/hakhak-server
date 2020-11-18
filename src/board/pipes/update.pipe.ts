import { PipeTransform, Injectable } from '@nestjs/common';
import { ApolloError } from 'apollo-server-express';
import { Exception } from '../../shared/constant';

@Injectable()
export class UpdatePipe implements PipeTransform {
  transform(value: any) {
    if (!value.title && !value.content) {
      throw new ApolloError(
        'Require Either title or content',
        Exception.BAD_REQUEST,
      );
    }

    return value;
  }
}
