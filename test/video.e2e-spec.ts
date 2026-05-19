/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '@src/app.module';
import { PrismaService } from '@src/prisma.service';
import fs from 'node:fs';
import request from 'supertest';
import { App } from 'supertest/types';

describe('VideoController (e2e)', () => {
  let module: TestingModule;
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    // No beforeEach e mais seguro
    prismaService = module.get<PrismaService>(PrismaService);
  });

  beforeEach(() => {
    jest
      .useFakeTimers({ advanceTimers: true })
      .setSystemTime(new Date('2023-01-01'));
  });

  afterEach(async () => {
    await prismaService.video.deleteMany();
  });

  afterAll(async () => {
    await module.close();
    fs.rmSync('./uploads', { recursive: true, force: true });
  });

  describe('/video (POST)', () => {
    it('uploads a video', async () => {
      const video = {
        title: 'Test Video',
        description: 'This is a test video',
        videoUrl: 'uploads/sample.mp4',
        thumbnailUrl: 'uploads/sample.jpg',
        sizeInKb: 33081763,
        duration: 100,
      };

      await request(app.getHttpServer() as App)
        .post('/video')
        .attach('video', './test/fixtures/sample.mp4')
        .attach('thumbnail', './test/fixtures/sample.jpg')
        .field('title', video.title)
        .field('description', video.description)
        .expect(HttpStatus.CREATED)
        .expect((response) => {
          expect(response.body).toMatchObject({
            title: video.title,
            description: video.description,
            url: expect.stringContaining('mp4') as string,
            thumbnailUrl: expect.stringContaining('jpg') as string,
            sizeInKb: video.sizeInKb,
            duration: video.duration,
          });
        });
    });

    it('throws an error when the thumbnail is not provided', async () => {
      const video = {
        title: 'Test Video',
        description: 'This is a test video',
        videoUrl: 'uploads/sample.mp4',
        thumbnailUrl: 'uploads/sample.jpg',
        sizeInKb: 33081763,
        duration: 100,
      };

      await request(app.getHttpServer() as App)
        .post('/video')
        .attach('video', './test/fixtures/sample.mp4')
        .field('title', video.title)
        .field('description', video.description)
        .expect(HttpStatus.BAD_REQUEST)
        .expect((response) => {
          expect(response.body).toMatchObject({
            message: 'Both video and thumbnail files are required',
            error: 'Bad Request',
            statusCode: 400,
          });
        });
    });

    it('does not allow non mp4 files', async () => {
      const video = {
        title: 'Test Video',
        description: 'This is a test video',
        videoUrl: 'uploads/sample.mp4',
        thumbnailUrl: 'uploads/sample.jpg',
        sizeInKb: 33081763,
        duration: 100,
      };

      await request(app.getHttpServer() as App)
        .post('/video')
        .attach('video', './test/fixtures/sample.mp3')
        .attach('thumbnail', './test/fixtures/sample.jpg')
        .field('title', video.title)
        .field('description', video.description)
        .expect(HttpStatus.BAD_REQUEST)
        .expect({
          message:
            'Invalid file type. Only video/mp4 and image/jpeg are supported.',
          error: 'Bad Request',
          statusCode: 400,
        });
    });
  });

  describe('/streams/:videoId (GET)', () => {
    it('streams a video', async () => {
      const { body: sampleVideo } = await request(app.getHttpServer() as App)
        .post('/video')
        .attach('video', './test/fixtures/sample.mp4')
        .attach('thumbnail', './test/fixtures/sample.jpg')
        .field('title', 'Sample Video')
        .field('description', 'This is a sample video')
        .expect(HttpStatus.CREATED);

      const fileSize = 33081763;
      const range = `bytes=0-${fileSize - 1}`;

      const response = await request(app.getHttpServer() as App)
        .get(`/stream/${sampleVideo.id}`)
        .set('Range', range)
        .expect(HttpStatus.PARTIAL_CONTENT);

      expect(response.headers['content-range']).toBe(
        `bytes 0-${fileSize - 1}/${fileSize}`,
      );

      expect(response.headers['accept-ranges']).toBe('bytes');
      expect(response.headers['content-length']).toBe(String(fileSize));
      expect(response.headers['content-type']).toBe('video/mp4');
    });

    it('returns 404 if the video is not found', async () => {
      await request(app.getHttpServer() as App)
        .get('/stream/invalid-video-id')
        .expect(HttpStatus.NOT_FOUND);
    });
  });
});
