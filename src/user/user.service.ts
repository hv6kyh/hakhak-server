import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.model';
import { UserCreate, UserSignin } from './dto';
import { JwtService } from '@nestjs/jwt';
import { ApolloError } from 'apollo-server-express';
import { Exception } from '../shared/constant';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private _usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {
    console.log('use this repository user', User);
  }

  public createUser(dto: UserCreate) {
    const newUser = this._usersRepository.create();
    Object.keys(dto).forEach((el) => {
      newUser[el] = dto[el];
    });
    return this._usersRepository.save(newUser);
  }

  public async signinUser(dto: UserSignin) {
    try {
      const { name, password } = dto;
      const user = await this._usersRepository.findOneOrFail({
        name,
        password,
      });

      return this.jwtService.sign({
        id: user.id,
        name: user.name,
      });
    } catch (e) {
      throw new ApolloError('Not Found User', Exception.NOT_FOUND);
    }
  }

  public async deleteUser(id: number) {
    const result = await this._usersRepository.softDelete(id);
    return !!result.affected;
  }
}
