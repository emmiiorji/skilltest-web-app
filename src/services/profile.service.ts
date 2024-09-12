import { ZodError } from 'zod';
import { AppDataSource } from '../database/connection';
import { Profile } from '../database/entities/Profile.entity';
import { ProfileInput, ProfileSchema } from '../database/validators/profile.validator';

class ProfileService {
	private profileRepository = AppDataSource.getRepository(Profile);

	async createProfile(data: ProfileInput): Promise<Profile> {
		try {
			const validatedData = ProfileSchema.parse(data);
			const profile = this.profileRepository.create(validatedData);
			await this.profileRepository.save(profile);
			return profile;
		} catch (error) {
			if (error instanceof ZodError) {
				throw error;
			}
			throw new Error('Failed to create profile');
		}
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
}

export const profileService = new ProfileService();