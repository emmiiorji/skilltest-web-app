import { Column, Entity, ManyToMany } from "typeorm";
import { BaseEntity } from "./BaseEntity.entity";
import { Group } from "./Group.entity";
import { Test } from "./Test.entity";

@Entity()
export class Profile extends BaseEntity {
  @Column({ nullable: true })
  link!: string;

  @Column({ nullable: true })
  url: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  title: string;

  @Column("text", { nullable: true })
  description: string;

  @Column({ type: "datetime", nullable: true })
  lastActivity: Date | null;

  @Column("decimal", { precision: 10, scale: 2, nullable: true })
  earned: number;

  @Column("decimal", { precision: 5, scale: 2, nullable: true })
  rate: number;

  @Column({ nullable: true })
  totalHours: number;

  @Column({ nullable: true })
  inProgress: boolean;

  @Column({ type: "datetime", nullable: true })
  invitedAt: Date | null;

  @Column({ length: 100, nullable: true })
  shortname: string;

  @Column({ nullable: true })
  recno: number;

  @Column("text", { nullable: true })
  agencies: string;

  @Column("decimal", { precision: 10, scale: 2, nullable: true })
  totalRevenue: number;

  @Column({ type: "datetime", nullable: true })
  memberSince: Date | null;

  @Column({ nullable: true })
  vanityUrl: string;

  @Column("text", { nullable: true })
  skills: string;

  @Column("text", { nullable: true })
  process: string;

  @ManyToMany(() => Test)
  tests: Test[];

  @ManyToMany(() => Group)
  groups: Group[];
}