import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Role, RoleDocument } from './schemas/role.schema';
import { IUser } from '../users/users.interface';
import mongoose from 'mongoose';
import aqp from 'api-query-params';
import { ADMIN_ROLE } from '../databases/sample';

@Injectable()
export class RolesService {
  constructor(
    @InjectModel(Role.name)
    private roleModel: SoftDeleteModel<RoleDocument>,
  ) {}

  async create(createRoleDto: CreateRoleDto, user: IUser) {
    const isExist = await this.roleModel.findOne({ name: createRoleDto.name });

    if (isExist) {
      throw new BadRequestException('Role is exist');
    }

    return this.roleModel.create({
      ...createRoleDto,
      createdBy: {
        _id: user._id,
        email: user.email,
      },
    });
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = (currentPage - 1) * limit;
    let defaultLimit = limit ? limit : 10;
    const totalItems = (await this.roleModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.roleModel
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
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new BadRequestException(`Not found role with id=${id}`);

    return this.roleModel.findById(id).populate({
      path: 'permissions',
      select: { _id: 1, apiPath: 1, method: 1, module: 1, name: 1 },
    });
  }

  update(id: string, updateRoleDto: UpdateRoleDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new BadRequestException(`Not found role with id=${id}`);

    return this.roleModel.findOneAndUpdate(
      { _id: id },
      {
        ...updateRoleDto,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
      { new: true },
    );
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new BadRequestException(`Not found role with id=${id}`);

    const foundRole = await this.roleModel.findById(id);

    if (foundRole.name === ADMIN_ROLE) {
      throw new BadRequestException('Cannot delete ADMIN role');
    }

    await this.roleModel.updateOne(
      { _id: id },
      { deletedBy: { _id: user._id, email: user.email } },
    );

    return this.roleModel.softDelete({ _id: id });
  }
}
