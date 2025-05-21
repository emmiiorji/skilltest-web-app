import { Column, Entity, JoinTable, ManyToMany, OneToMany } from "typeorm";
import { BaseEntity } from "./BaseEntity.entity";
import { Group } from "./Group.entity";
import { Profile } from "./Profile.entity";
import { QuestionTest } from "./QuestionTest.entity";

@Entity("tests")
export class Test extends BaseEntity {
  @Column()
  name: string;

  @ManyToMany(() => Profile, { nullable: true })
  @JoinTable({
    name: "tests_profiles",
    joinColumn: {
      name: "testId",
      referencedColumnName: "id"
    },
    inverseJoinColumn: {
      name: "profileId",
      referencedColumnName: "id"
    }
  })
  profiles: Profile[];

  @ManyToMany(() => Group, { nullable: true })
  @JoinTable({
    name: "tests_groups",
    joinColumn: {
      name: "testId",
      referencedColumnName: "id"
    },
    inverseJoinColumn: {
      name: "groupId",
      referencedColumnName: "id"
    }
  })
  groups: Group[] | null;

  @OneToMany(() => QuestionTest, questionTest => questionTest.test)
  questionTests: QuestionTest[];

  @Column("json", { default: {} })
  tracking_config: any;
}