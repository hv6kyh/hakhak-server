import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.model';
import { UserCreate, UserSignin } from './dto';
import { JwtService } from '@nestjs/jwt';

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
    const { name, password } = dto;
    const user = await this._usersRepository.findOneOrFail({ name, password });

    return this.jwtService.sign({
      id: user.id,
      name: user.name,
    });
  }

  // public getUser(name: string) {
  //   return this._usersRepository.findOneOrFail({name: name});
  // }
}
