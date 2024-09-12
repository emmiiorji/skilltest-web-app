import { Column, Entity, ManyToMany } from "typeorm";
import { BaseEntity } from "./BaseEntity";
import { Test } from "./Test";

@Entity("templates")
export class Template extends BaseEntity {
  @Column("text")
  template: string;

  @ManyToMany(() => Test, test => test.templates)
  tests: Test[];
}