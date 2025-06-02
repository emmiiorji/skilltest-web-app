import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, RelationId } from "typeorm";
import { Profile } from "./Profile.entity";
import { Test } from "./Test.entity";

@Entity("tests_profiles")
export class TestProfile {
    @RelationId("test")
    @PrimaryColumn()
    testId: number;

    @RelationId("profile")
    @PrimaryColumn()
    profileId: number;

    @Column({ type: "datetime", nullable: true })
    test_start_time: Date | null;

    @ManyToOne(() => Test, test => test.testProfiles, { onDelete: "CASCADE", onUpdate: "CASCADE" })
    @JoinColumn({ name: "testId" })
    test: Test;

    @ManyToOne(() => Profile, profile => profile.testProfiles, { onDelete: "CASCADE", onUpdate: "CASCADE" })
    @JoinColumn({ name: "profileId" })
    profile: Profile;
}
