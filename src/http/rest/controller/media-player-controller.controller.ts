/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Get,
  HttpStatus,
  Req,
  Header,
  Param,
  Res,
  NotFoundException,
} from '@nestjs/common';
import fs from 'fs';
import path from 'node:path';
import type { Request, Response } from 'express';
import { MediaPlayerService } from '@src/core/service/media-player-service';
import { VideoNotFoundException } from '@src/core/exception/video-not-found-exception';

@Controller('stream')
export class MediaPlayerController {
  constructor(private readonly mediaPlayerService: MediaPlayerService) {}

  @Get(':videoId')
  @Header('Content-Type', 'video/mp4')
  async streamVideo(
    @Param('videoId') videoId: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<any> {
    // TODO: implementar stream de video

    try {
      const video = await this.mediaPlayerService.prepareStreaming(videoId);
      if (!video) {
        throw new NotFoundException('Video not found');
      }

      const videoPath = path.join('.', video);
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
    } catch (error) {
      if (error instanceof VideoNotFoundException) {
        return res.status(HttpStatus.NOT_FOUND).send({
          message: error.message,
          error: error.name,
          statusCode: HttpStatus.NOT_FOUND,
        });
      }
      throw error;
    }
  }
}
