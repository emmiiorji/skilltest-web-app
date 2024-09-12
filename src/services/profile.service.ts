import { Repository } from "typeorm";
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { ZodError } from 'zod';
import { AppDataSource } from '../database/connection';
import { Profile } from '../database/entities/Profile.entity';
import { ProfileInput, ProfileSchema } from '../database/validators/profile.validator';

class ProfileService {
	private profileRepository: Repository<Profile>;

	constructor() {
		this.profileRepository = AppDataSource.getRepository(Profile);
	}

	async createProfile(data: ProfileInput, group_id: number): Promise<Profile> {
		try {
			const validatedData = ProfileSchema.parse(data);
			const profile = this.profileRepository.create({...validatedData, groups: [{id: group_id}]});
			await this.profileRepository.save(profile);
			return profile;
		} catch (error) {
			if (error instanceof ZodError) {
				throw error;
			}
			throw new Error('Failed to create profile');
		}
	}

	async createProfileById(id: number, group_id: number): Promise<Profile> {
		const profile = this.profileRepository.create({
			id,
			name: `User ${id}`,
			groups: [{id: group_id}]
		});
		return await this.profileRepository.save(profile);
	}

	async getProfiles(page: number, limit: number) {
		const [profiles, total] = await this.profileRepository.findAndCount({
			skip: (page - 1) * limit,
			take: limit,
			order: { createdAt: 'DESC' }
		});

		const totalPages = Math.ceil(total / limit);

		return {
			profiles,
			totalPages,
			currentPage: page
		};
	}

	async getProfilesIdAndName(): Promise<{ id: number; name: string }[]> {
		return this.profileRepository.find({
			select: ['id', 'name'],
			order: { name: 'ASC' }
		});
	}

	async getProfileById(id: number): Promise<Profile | null> {
		return this.profileRepository.findOne({
			where: { id },
			relations: ["groups"]
		});
	}

	async updateProfile(id: number, updateData: QueryDeepPartialEntity<Profile>) {
		return await AppDataSource.getRepository(Profile).update(id, updateData);
	}
}

export const profileService = new ProfileService();