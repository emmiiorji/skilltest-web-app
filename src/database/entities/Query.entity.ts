import { Column, Entity } from 'typeorm';
import { BaseEntity } from './BaseEntity.entity';

@Entity('queries')
export class Query extends BaseEntity {
  @Column({ type: 'varchar', length: 1000, nullable: true })
  query: string | null;
}

// CREATE TABLE IF NOT EXISTS `queries` (
//   `id` int(11) NOT NULL AUTO_INCREMENT,
//   `query` varchar(1000) DEFAULT NULL,
//   PRIMARY KEY (`id`)
// )