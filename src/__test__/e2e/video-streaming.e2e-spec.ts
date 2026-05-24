/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '@src/app.module';
import { ContentManagementService } from '@src/core/service/content-management';
import request from 'supertest';
import { App } from 'supertest/types';
import { VideoRepository } from '@src/persistence/repository/video.repository';

describe('VideoController (e2e) | Streaming', () => {
  let module: TestingModule;
  let app: INestApplication;
  let videoRepository: VideoRepository;
  let contentManagementService: ContentManagementService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    // No beforeEach e mais seguro
    videoRepository = module.get<VideoRepository>(VideoRepository);
    contentManagementService = module.get<ContentManagementService>(
      ContentManagementService,
    );
  });

  beforeEach(() => {
    jest
      .useFakeTimers({ advanceTimers: true })
      .setSystemTime(new Date('2023-01-01'));
  });

  afterEach(async () => {
    await videoRepository.clear();
  });

  afterAll(async () => {
    await module.close();
  });

  describe('/streams/:videoId (GET)', () => {
    it('streams a video', async () => {
      const sampleVideo = await contentManagementService.createContent({
        title: 'Sample Video',
        description: 'This is a sample video',
        url: './test/fixtures/sample.mp4',
        thumbnailUrl: './test/fixtures/sample.jpg',
        sizeInKb: 33081763,
      });

      const fileSize = 33081763;
      const range = `bytes=0-${fileSize - 1}`;

      const response = await request(app.getHttpServer() as App)
        .get(`/stream/${sampleVideo.getMedia()?.getVideo().getId()}`)
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
