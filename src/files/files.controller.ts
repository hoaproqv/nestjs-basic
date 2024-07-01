import {
  Controller,
  Post,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
  ParseFilePipeBuilder,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResponseMessage } from '../decorators/message.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Files')
@Controller('files')
export class FilesController {
  @Post('upload')
  @ResponseMessage('File uploaded')
  @UseInterceptors(FileInterceptor('fileUpload'))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return {
      fileName: file.filename,
    };
  }

  @Delete(':id')
  remove(@Param('id') id: string) {}
}
