import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto, RegisterUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { compareSync, genSaltSync, hashSync } from 'bcryptjs';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from './users.interface';
import aqp from 'api-query-params';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>,
  ) {}

  getHashPassword = (password: string) => {
    const salt = genSaltSync(10);
    return hashSync(password, salt);
  };

  isValidPassword(password: string, hashPassword: string) {
    return compareSync(password, hashPassword);
  }

  async create(createUserDto: CreateUserDto, user: IUser) {
    const isExist = await this.userModel.findOne({
      email: createUserDto.email,
    });
    if (isExist)
      throw new BadRequestException(
        `Email ${createUserDto.email} already exists`,
      );

    createUserDto.password = this.getHashPassword(createUserDto.password);

    const result = await this.userModel.create({
      ...createUserDto,
      createdBy: { _id: user._id, email: user.email },
    });

    const { password, ...data } = result.toObject();
    return data;
  }

  async register(registerUserDto: RegisterUserDto) {
    const isExist = await this.userModel.findOne({
      email: registerUserDto.email,
    });
    if (isExist)
      throw new BadRequestException(
        `Email ${registerUserDto.email} already exists`,
      );

    registerUserDto.password = this.getHashPassword(registerUserDto.password);
    registerUserDto.role = 'USER';
    const result = await this.userModel.create(registerUserDto);
    const { password, ...data } = result.toObject();
    return data;
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = (currentPage - 1) * limit;
    let defaultLimit = limit ? limit : 10;
    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.userModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .exec();

    return {
      meta: {
        current: currentPage,
        pageSize: limit,
        pages: totalPages,
        total: totalItems,
      },
      result,
    };
  }

  findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) return 'Not found user';
    return this.userModel.findOne({ _id: id }).lean();
  }

  findOneByUserName(username: string) {
    return this.userModel.findOne({ email: username });
  }

  update(updateUserDto: UpdateUserDto, user: IUser) {
    return this.userModel
      .findOneAndUpdate(
        { _id: updateUserDto._id },
        {
          updateBy: {
            _id: user._id,
            email: user.email,
          },
          ...updateUserDto,
        },
        { new: true },
      )
      .lean();
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) return 'Not found user';

    await this.userModel.updateOne(
      { _id: id },
      { deletedBy: { _id: user._id, email: user.email } },
    );
    return this.userModel.softDelete({ _id: id });
  }

  updateUserToken(refreshToken: string, _id: string) {
    return this.userModel.updateOne({ _id }, { refreshToken });
  }

  findUserByRefreshToken(refreshToken: string) {
    return this.userModel.findOne({ refreshToken });
  }
}
