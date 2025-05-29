import { ZodError } from 'zod';
import { connection } from '../database/connection';
import { Profile } from '../database/entities/Profile.entity';
import { ProfileInput, ProfileSchema } from '../database/validators/profile.validator';

class ProfileService {

	async createProfile(data: ProfileInput, group_id: number): Promise<Profile> {
		try {
			const dataSource = await connection();
			const profileRepository = dataSource.getRepository(Profile);
			const validatedData = ProfileSchema.parse(data);
			const profile = profileRepository.create({...validatedData, groups: [{id: group_id}]});
			await profileRepository.save(profile);
			return profile;
		} catch (error) {
			if (error instanceof Error) {
				// Check for MySQL duplicate entry error
				if (error.message.includes('ER_DUP_ENTRY') || error.message.includes('Duplicate entry')) {
					// Extract the field name from the error message
					throw new Error(error.message);
				}
			}
			if (error instanceof ZodError) {
				throw error;
			}
			throw new Error('Failed to create profile');
		}
	}

	async createProfileByLinkId(userLinkId: string): Promise<Profile> {
		const dataSource = await connection();
		const profileRepository = dataSource.getRepository(Profile);
		const profile = profileRepository.create({
			link: userLinkId,
			name: `User ${userLinkId}`,
			groups: [] // Initialize empty groups array
		});
		return await profileRepository.save(profile);
	}

	async getProfiles(page: number, limit: number) {
		const dataSource = await connection();
		const profileRepository = dataSource.getRepository(Profile);
		const [profiles, total] = await profileRepository.findAndCount({
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
		const dataSource = await connection();
		const profileRepository = dataSource.getRepository(Profile);
		return profileRepository.find({
			select: ['id', 'name'],
			order: { name: 'ASC' }
		});
	}

	async getProfileByLinkId(id: string): Promise<Profile | null> {
		const dataSource = await connection();
		const profileRepository = dataSource.getRepository(Profile);
		return profileRepository.findOne({
			where: { link: id },
			relations: ["groups"]
		});
	}

	async updateProfile(profile: Profile, groupId: number) {
		const dataSource = await connection();
		const profileRepository = dataSource.getRepository(Profile);
		return profileRepository.save({
			...profile,
			groups: [...profile.groups, {id: groupId}]
		});
	}
}

export const profileService = new ProfileService();
