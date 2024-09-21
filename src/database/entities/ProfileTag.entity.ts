import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Profile } from './Profile.entity';
import { Tag } from './Tag.entity';

@Entity('profile_tags')
export class ProfileTag {
  @PrimaryColumn()
  profile_id: number;

  @PrimaryColumn()
  tag_id: number;

  @ManyToOne(() => Profile, profile => profile.profileTags)
  @JoinColumn({ name: 'profile_id' })
  profile: Profile;

  @ManyToOne(() => Tag, tag => tag.profileTags)
  @JoinColumn({ name: 'tag_id' })
  tag: Tag;
}

// CREATE TABLE IF NOT EXISTS `profile_tags` (
//   `profile_id` int(11) NOT NULL,
//   `tag_id` int(11) NOT NULL,
//   PRIMARY KEY (`profile_id`,`tag_id`),
//   KEY `tag_id` (`tag_id`),
//   CONSTRAINT `profile_tags_ibfk_1` FOREIGN KEY (`profile_id`) REFERENCES `profile` (`id`),
//   CONSTRAINT `profile_tags_ibfk_2` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`)
// )