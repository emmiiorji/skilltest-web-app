import { Column, Entity } from "typeorm";
import { BaseEntity } from "./BaseEntity.entity";

@Entity("templates")
export class Template extends BaseEntity {
  @Column("text")
  template: string;
}