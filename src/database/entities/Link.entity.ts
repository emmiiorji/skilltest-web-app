import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './BaseEntity.entity';
import { Tag } from './Tag.entity';

@Entity('links')
export class Link extends BaseEntity {
  @Column({ nullable: true })
  tag_id: number;

  @Column({ length: 1000, nullable: true })
  link: string;

  @Column({ type: 'boolean', nullable: true })
  active: boolean;

  @ManyToOne(() => Tag, { nullable: true })
  @JoinColumn({ name: 'tag_id' })
  tag: Tag;
}

// CREATE TABLE IF NOT EXISTS `links` (
//   `id` int(11) NOT NULL AUTO_INCREMENT,
//   `tag_id` int(11) DEFAULT NULL,
//   `link` varchar(1000) DEFAULT NULL,
//   `active` tinyint(1) DEFAULT NULL,
//   PRIMARY KEY (`id`),
//   KEY `tag_id` (`tag_id`)
// )