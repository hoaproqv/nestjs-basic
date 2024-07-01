import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { SubscribersService } from './subscribers.service';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { UpdateSubscriberDto } from './dto/update-subscriber.dto';
import { ResponseMessage } from '../decorators/message.decorator';
import { User } from '../decorators/user.decorator';
import { IUser } from '../users/users.interface';
import { PublicPermission } from '../decorators/isPublic.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Subscribers')
@Controller('subscribers')
export class SubscribersController {
  constructor(private readonly subscribersService: SubscribersService) {}

  @Post()
  @ResponseMessage('Create subscriber')
  create(
    @Body() createSubscriberDto: CreateSubscriberDto,
    @User() user: IUser,
  ) {
    return this.subscribersService.create(createSubscriberDto, user);
  }

  @Post('skills')
  @ResponseMessage("Get subscriber's skills")
  @PublicPermission()
  getUserSkills(@User() user: IUser) {
    return this.subscribersService.getSkills(user);
  }

  @Get()
  @ResponseMessage('Get all subscribers')
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
  ) {
    return this.subscribersService.findAll(+currentPage, +limit, qs);
  }

  @Get(':id')
  @ResponseMessage('Get subscriber by id')
  findOne(@Param('id') id: string) {
    return this.subscribersService.findOne(id);
  }

  @Patch()
  @PublicPermission()
  @ResponseMessage('Update subscriber')
  update(
    @Body() updateSubscriberDto: UpdateSubscriberDto,
    @User() user: IUser,
  ) {
    return this.subscribersService.update(updateSubscriberDto, user);
  }

  @Delete(':id')
  @ResponseMessage('Delete subscriber')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.subscribersService.remove(id, user);
  }
}
