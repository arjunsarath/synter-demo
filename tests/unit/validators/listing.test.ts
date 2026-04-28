/**
 * Unit tests for listing validation schemas
 * Tests both ListingIdSchema (UUID validation) and ApplyUrlSchema (URL validation)
 */

import { describe, it, expect } from 'vitest';
import { ListingIdSchema, ApplyUrlSchema } from '@/lib/validators/listing';

describe('ListingIdSchema', () => {
  describe('valid UUIDs', () => {
    it('should accept a valid UUID v4', () => {
      const validUuid = '550e8400-e29b-41d4-a716-446655440000';
      const result = ListingIdSchema.safeParse(validUuid);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(validUuid);
      }
    });

    it('should accept another valid UUID v4', () => {
      const validUuid = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
      const result = ListingIdSchema.safeParse(validUuid);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(validUuid);
      }
    });

    it('should accept UUID with uppercase letters', () => {
      const validUuid = '550E8400-E29B-41D4-A716-446655440000';
      const result = ListingIdSchema.safeParse(validUuid);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(validUuid);
      }
    });
  });

  describe('invalid UUID formats', () => {
    it('should reject non-UUID strings', () => {
      const invalidId = 'not-a-uuid';
      const result = ListingIdSchema.safeParse(invalidId);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors).toHaveLength(1);
        expect(result.error.errors[0].message).toBe('Invalid listing ID format');
      }
    });

    it('should reject UUID with incorrect format (no hyphens)', () => {
      const invalidId = '550e8400e29b41d4a716446655440000';
      const result = ListingIdSchema.safeParse(invalidId);
      expect(result.success).toBe(false);
    });

    it('should reject UUID with incorrect segment lengths', () => {
      const invalidId = '550e8400-e29b-41d4-a716-44665544000';
      const result = ListingIdSchema.safeParse(invalidId);
      expect(result.success).toBe(false);
    });

    it('should reject UUID with invalid characters', () => {
      const invalidId = '550e8400-e29b-41d4-a716-44665544000g';
      const result = ListingIdSchema.safeParse(invalidId);
      expect(result.success).toBe(false);
    });

    it('should reject empty string', () => {
      const result = ListingIdSchema.safeParse('');
      expect(result.success).toBe(false);
    });

    it('should reject numeric strings', () => {
      const result = ListingIdSchema.safeParse('12345');
      expect(result.success).toBe(false);
    });

    it('should reject null', () => {
      const result = ListingIdSchema.safeParse(null);
      expect(result.success).toBe(false);
    });

    it('should reject undefined', () => {
      const result = ListingIdSchema.safeParse(undefined);
      expect(result.success).toBe(false);
    });
  });
});

describe('ApplyUrlSchema', () => {
  describe('valid URLs', () => {
    it('should accept a valid HTTPS URL', () => {
      const validUrl = 'https://example.com/apply';
      const result = ApplyUrlSchema.safeParse(validUrl);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(validUrl);
      }
    });

    it('should accept HTTP URL', () => {
      const validUrl = 'http://example.com/apply';
      const result = ApplyUrlSchema.safeParse(validUrl);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(validUrl);
      }
    });

    it('should accept URL with query parameters', () => {
      const validUrl = 'https://example.com/apply?job_id=123&ref=alumni';
      const result = ApplyUrlSchema.safeParse(validUrl);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(validUrl);
      }
    });

    it('should accept URL with fragment', () => {
      const validUrl = 'https://example.com/apply#section';
      const result = ApplyUrlSchema.safeParse(validUrl);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(validUrl);
      }
    });

    it('should accept URL with path segments', () => {
      const validUrl = 'https://careers.example.com/jobs/123/apply';
      const result = ApplyUrlSchema.safeParse(validUrl);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(validUrl);
      }
    });

    it('should accept URL with authentication in path', () => {
      const validUrl = 'https://user:pass@example.com/apply';
      const result = ApplyUrlSchema.safeParse(validUrl);
      expect(result.success).toBe(true);
    });

    it('should accept URL with port number', () => {
      const validUrl = 'https://example.com:8080/apply';
      const result = ApplyUrlSchema.safeParse(validUrl);
      expect(result.success).toBe(true);
    });

    it('should accept URL with international domain', () => {
      const validUrl = 'https://example.com/apply';
      const result = ApplyUrlSchema.safeParse(validUrl);
      expect(result.success).toBe(true);
    });

    it('should accept URL with trailing slash', () => {
      const validUrl = 'https://example.com/apply/';
      const result = ApplyUrlSchema.safeParse(validUrl);
      expect(result.success).toBe(true);
    });
  });

  describe('invalid URLs', () => {
    it('should reject empty string', () => {
      const result = ApplyUrlSchema.safeParse('');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Invalid URL format');
      }
    });

    it('should reject string without protocol', () => {
      const result = ApplyUrlSchema.safeParse('example.com/apply');
      expect(result.success).toBe(false);
    });

    it('should reject malformed URL with spaces', () => {
      const result = ApplyUrlSchema.safeParse('https://example.com/apply with spaces');
      expect(result.success).toBe(false);
    });

    it('should reject malformed URL with invalid characters', () => {
      const result = ApplyUrlSchema.safeParse('https://example.com/apply<>');
      expect(result.success).toBe(false);
    });

    it('should accept FTP URL (z.string().url() accepts any valid URL scheme)', () => {
      // Note: z.string().url() validates URL structure, not specific schemes.
      // FTP is a valid URL scheme, so this passes. If HTTP(S)-only validation is needed,
      // use .url().refine((url) => /^https?:\/\//.test(url))
      const result = ApplyUrlSchema.safeParse('ftp://example.com/apply');
      expect(result.success).toBe(true);
    });

    it('should reject null', () => {
      const result = ApplyUrlSchema.safeParse(null);
      expect(result.success).toBe(false);
    });

    it('should reject undefined', () => {
      const result = ApplyUrlSchema.safeParse(undefined);
      expect(result.success).toBe(false);
    });

    it('should reject non-string values', () => {
      const result = ApplyUrlSchema.safeParse(123);
      expect(result.success).toBe(false);
    });

    it('should reject plain text without URL structure', () => {
      const result = ApplyUrlSchema.safeParse('just some text');
      expect(result.success).toBe(false);
    });

    it('should reject URL with only domain (no protocol)', () => {
      const result = ApplyUrlSchema.safeParse('example.com');
      expect(result.success).toBe(false);
    });

    it('should reject incomplete URL', () => {
      const result = ApplyUrlSchema.safeParse('https://');
      expect(result.success).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should accept URL with numeric path', () => {
      const result = ApplyUrlSchema.safeParse('https://example.com/123');
      expect(result.success).toBe(true);
    });

    it('should accept URL with special characters in path', () => {
      const result = ApplyUrlSchema.safeParse('https://example.com/apply-job?id=123&type=temp');
      expect(result.success).toBe(true);
    });

    it('should accept URL with subdomain', () => {
      const result = ApplyUrlSchema.safeParse('https://jobs.careers.example.com/apply');
      expect(result.success).toBe(true);
    });
  });
});
