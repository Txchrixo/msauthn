import { User } from '@/core/entities';
import { PayloadData } from '@/core/types';

/**
 * Maps a User entity to a PayloadData object to be used in token generation.
 * @param {User} user - The user entity to map.
 * @returns {PayloadData} - The transformed PayloadData object.
 */
export function mapUserToPayloadData(user: User): PayloadData {
  return {
    sub: user.id,
    email: user.email,
    role: user.role,
  };
}
