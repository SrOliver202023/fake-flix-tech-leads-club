import { randomUUID } from 'node:crypto';
import { BaseEntity, BaseEntityProps } from './base.entity';
import { MovieEntity } from './movie.entity';

type NewContentEntity = Omit<
  ContentEntityProps,
  'id' | 'createdAt' | 'updatedAt'
>;

export interface ContentEntityProps extends BaseEntityProps {
  media?: MovieEntity;
  type: ContentType;
  title: string;
  description: string;
}

export const ContentType: { [x: string]: 'MOVIE' | 'TV_SHOW' } = {
  MOVIE: 'MOVIE',
  TV_SHOW: 'TV_SHOW',
};

export type ContentType = (typeof ContentType)[keyof typeof ContentType];

export class ContentEntity extends BaseEntity {
  private media?: ContentEntityProps['media'];
  type: ContentEntityProps['type'];
  title: ContentEntityProps['title'];
  description: ContentEntityProps['description'];

  constructor(data: ContentEntityProps) {
    super(data);
    Object.assign(this, data);
  }

  static createNew(data: NewContentEntity): ContentEntity {
    return new ContentEntity({
      id: randomUUID(),
      media: data.media,
      description: data.description,
      type: data.type,
      title: data.title,
      updatedAt: new Date(),
      createdAt: new Date(),
    });
  }

  static createFrom(data: ContentEntityProps): ContentEntity {
    return new ContentEntity({
      id: data.id,
      media: data.media,
      description: data.description,
      type: data.type,
      title: data.title,
      updatedAt: data.updatedAt,
      createdAt: data.createdAt,
    });
  }

  serialize() {
    return {
      id: this.id,
      media: this.media?.serialize(),
      description: this.description,
      type: this.type,
      title: this.title,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  getMedia() {
    return this.media;
  }

  addMedia(media: MovieEntity) {
    this.media = media;
  }

  getType(): ContentType {
    return this.type;
  }

  getTitle(): string {
    return this.title;
  }

  getDescription(): string {
    return this.description;
  }
}
