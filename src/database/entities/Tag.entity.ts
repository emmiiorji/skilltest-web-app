import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from './BaseEntity.entity';
import { Link } from './Link.entity';
import { ProfileTag } from './ProfileTag.entity';

@Entity('tags')
export class Tag extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @OneToMany(() => Link, (link) => link.tag)
  links: Link[];

  @OneToMany(() => ProfileTag, (profileTag) => profileTag.tag)
  profileTags: ProfileTag[];
}

// CREATE TABLE IF NOT EXISTS `tags` (
//   `id` int(11) NOT NULL AUTO_INCREMENT,
//   `name` varchar(255) NOT NULL,
//   PRIMARY KEY (`id`)
// )