import { Column, Entity, JoinTable, ManyToMany } from "typeorm";
import { BaseEntity } from "./BaseEntity";
import { Profile } from "./Profile";
import { Test } from "./Test";

@Entity("groups")
export class Group extends BaseEntity {
  @Column()
  name: string;

  @ManyToMany(() => Test)
  @JoinTable({ name: "group_tests" })
  tests: Test[];

  @ManyToMany(() => Profile)
  @JoinTable({ name: "group_profiles" })
  profiles: Profile[];
}