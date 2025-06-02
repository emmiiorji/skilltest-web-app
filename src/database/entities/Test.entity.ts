import { Column, Entity, JoinTable, ManyToMany, OneToMany } from "typeorm";
import { BaseEntity } from "./BaseEntity.entity";
import { Group } from "./Group.entity";
import { QuestionTest } from "./QuestionTest.entity";
import { TestProfile } from "./TestProfile.entity";
import { TrackingConfig } from "../../types/tracking";

@Entity("tests")
export class Test extends BaseEntity {
  @Column()
  name: string;

  @OneToMany(() => TestProfile, testProfile => testProfile.test)
  testProfiles: TestProfile[];

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
  tracking_config: TrackingConfig;
}