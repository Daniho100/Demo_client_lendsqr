import { jest } from '@jest/globals';

export const sign = jest.fn().mockReturnValue('mocked_token');
export const verify = jest.fn().mockImplementation((token, secret) => {
  if (token === 'valid_token') {
    return { userId: 1, email: 'test@example.com' };
  }
  throw new Error('Invalid token');
});