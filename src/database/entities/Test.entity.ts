import { Column, Entity, JoinTable, ManyToMany } from "typeorm";
import { BaseEntity } from "./BaseEntity.entity";
import { Group } from "./Group.entity";
import { Profile } from "./Profile.entity";
import { Template } from "./Template.entity";

@Entity("tests")
export class Test extends BaseEntity {
  @Column()
  name: string;

  @ManyToMany(() => Profile)
  @JoinTable({name: "tests_profiles"})
  profiles: Profile[];

  @ManyToMany(() => Group)
  @JoinTable({name: "tests_groups"})
  groups: Group[];

  @ManyToMany(() => Template, template => template.tests)
  @JoinTable({name: "tests_templates"})
  templates: Template[];
}