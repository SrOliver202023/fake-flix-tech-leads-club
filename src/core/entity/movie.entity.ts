import { randomUUID } from 'node:crypto';
import { BaseEntity, BaseEntityProps } from './base.entity';
import { ThumbnailEntity } from './thumbnail.entity';
import { VideoEntity } from './video.entity';

export type NewMovieEntity = Omit<
  MovieEntityProps,
  'id' | 'createdAt' | 'updatedAt'
>;

export interface MovieEntityProps extends BaseEntityProps {
  video: VideoEntity;
  thumbnail?: ThumbnailEntity;
}

export class MovieEntity extends BaseEntity {
  private video: MovieEntityProps['video'];
  private thumbnail: MovieEntityProps['thumbnail'];

  constructor(data: MovieEntityProps) {
    super(data);
    Object.assign(this, data);
  }

  static createNew(data: NewMovieEntity): MovieEntity {
    return new MovieEntity({
      id: randomUUID(),
      video: data.video,
      thumbnail: data.thumbnail,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static createFrom(data: MovieEntityProps): MovieEntity {
    return new MovieEntity({
      id: data.id,
      video: data.video,
      thumbnail: data.thumbnail,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  serialize() {
    return {
      id: this.id,
      video: this.video.serialize(),
      thumbnail: this.thumbnail?.serialize(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  getVideo(): VideoEntity {
    return this.video;
  }

  // Muito legal para quando tem uma entidade dentro de outra, caso queira fazer alguma acao ou evento quando adiciona
  addVideo(video: VideoEntity): void {
    this.video = video;
  }

  getThumbnail(): ThumbnailEntity | undefined {
    return this?.thumbnail;
  }

  addThumbnail(thumbnail: ThumbnailEntity): void {
    this.thumbnail = thumbnail;
  }
}
