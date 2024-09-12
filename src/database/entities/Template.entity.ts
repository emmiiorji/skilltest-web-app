import { Column, Entity, ManyToMany } from "typeorm";
import { BaseEntity } from "./BaseEntity.entity";
import { Test } from "./Test.entity";

@Entity("templates")
export class Template extends BaseEntity {
  @Column("text")
  template: string;

  @ManyToMany(() => Test, test => test.templates)
  tests: Test[];
}