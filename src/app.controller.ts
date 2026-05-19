import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UploadedFiles,
  UseInterceptors,
  Header,
  Param,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { AppService } from './app.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import { PrismaService } from './prisma.service';
import fs from 'fs';
import path from 'node:path';
import type { Request, Response } from 'express';
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prismaService: PrismaService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('video')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'video', maxCount: 1 },
        { name: 'thumbnail', maxCount: 1 },
      ],
      {
        dest: 'uploads',
        storage: diskStorage({
          destination: './uploads',
          filename: (req, file, cb) => {
            return cb(
              null,
              `${Date.now()}-${randomUUID()}${extname(file.originalname)}`,
            );
          },
        }),
        fileFilter: (req, file, cb) => {
          if (file.mimetype !== 'video/mp4' && file.mimetype !== 'image/jpeg') {
            return cb(
              new BadRequestException(
                'Invalid file type. Only video/mp4 and image/jpeg are supported.',
              ),
              false,
            );
          }
          return cb(null, true);
        },
      },
    ),
  )
  async uploadVideo(
    @Req() _req: Request,
    @Body() contentData: { title: string; description: string },
    @UploadedFiles()
    files: { video?: Express.Multer.File[]; thumbnail?: Express.Multer.File[] },
  ): Promise<any> {
    const videoFile = files.video?.[0];
    const thumbnailFile = files.thumbnail?.[0];

    if (!videoFile || !thumbnailFile) {
      throw new BadRequestException(
        'Both video and thumbnail files are required',
      );
    }

    return await this.prismaService.video.create({
      data: {
        id: randomUUID(),
        url: videoFile.path,
        thumbnailUrl: thumbnailFile.path,
        duration: 100,
        sizeInKb: videoFile.size,
        title: contentData.title ?? '...',
        description: contentData.description ?? '...',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  @Get('stream/:videoId')
  @Header('Content-Type', 'video/mp4')
  async streamVideo(
    @Param('videoId') videoId: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<any> {
    // TODO: implementar stream de video
    const video = await this.prismaService.video.findUnique({
      where: {
        id: videoId,
      },
    });

    if (!video) {
      throw new NotFoundException('Video not found');
    }

    const videoPath = path.join('.', video.url);
    const filesize = fs.statSync(videoPath).size;

    // Iniciar apartir de um ponto especifico do video
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : filesize - 1;

      const chunksize = end - start + 1;
      const file = fs.createReadStream(videoPath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${filesize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      };

      res.writeHead(HttpStatus.PARTIAL_CONTENT, head);
      return file.pipe(res);
    }

    return res.writeHead(HttpStatus.OK, {
      'Content-Length': filesize,
      'Content-Type': 'video/mp4',
    });
  }
}
