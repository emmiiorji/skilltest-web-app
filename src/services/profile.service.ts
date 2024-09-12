import { ZodError } from 'zod';
import { AppDataSource } from '../database/connection';
import { Profile } from '../database/entities/Profile';
import { ProfileInput, ProfileSchema } from '../database/validators/profile.validator';

class ProfileService {
  async createProfile(data: ProfileInput): Promise<Profile> {
    try {
      const validatedData = ProfileSchema.parse(data);
      const profileRepository = AppDataSource.getRepository(Profile); // Use DataSource to get the repository
      const profile = profileRepository.create(validatedData);
      await profileRepository.save(profile);
      return profile;
    } catch (error) {
      if (error instanceof ZodError) {
        throw error; // Throw the original ZodError
      }
      throw new Error('Failed to create profile');
    }
  }

  async getProfiles(page: number, limit: number) {
    const profileRepository = AppDataSource.getRepository(Profile);
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
}

export const profileService = new ProfileService();