import { Column, Entity, ManyToMany } from "typeorm";
import { BaseEntity } from "./BaseEntity";
import { Group } from "./Group";
import { Profile } from "./Profile";

@Entity("tests")
export class Test extends BaseEntity {
  @Column()
  name: string;

  @ManyToMany(() => Profile)
  profiles: Profile[];

  @ManyToMany(() => Group)
  groups: Group[];
}