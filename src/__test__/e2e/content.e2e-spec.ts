/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '@src/app.module';
import { ContentRepository } from '@src/persistence/repository/content.repository';
import fs from 'node:fs';
import request from 'supertest';
import { App } from 'supertest/types';

describe('VideoController (e2e) | Content', () => {
  let module: TestingModule;
  let app: INestApplication;
  let contentRepository: ContentRepository;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    // No beforeEach e mais seguro
    contentRepository = module.get<ContentRepository>(ContentRepository);
  });

  beforeEach(() => {
    jest
      .useFakeTimers({ advanceTimers: true })
      .setSystemTime(new Date('2023-01-01'));
  });

  afterEach(async () => {
    await contentRepository.clear();
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
        videoUrl: './test/fixtures/sample.mp4',
        thumbnailUrl: './test/fixtures/sample.jpg',
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
});
