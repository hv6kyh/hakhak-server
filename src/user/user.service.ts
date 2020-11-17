import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.model';
import { UserCreate } from './dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private _usersRepository: Repository<User>,
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
}
