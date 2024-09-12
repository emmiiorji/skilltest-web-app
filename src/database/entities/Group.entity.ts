import { Column, Entity, JoinTable, ManyToMany } from "typeorm";
import { BaseEntity } from "./BaseEntity.entity";
import { Profile } from "./Profile.entity";
import { Test } from "./Test.entity";

@Entity("groups")
export class Group extends BaseEntity {
  @Column()
  name: string;

  @ManyToMany(() => Test)
  tests: Test[];

  @ManyToMany(() => Profile)
  @JoinTable({ name: "group_profiles" })
  profiles: Profile[];
}