import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isExpired } from '@/lib/listings';

describe('isExpired', () => {
  let mockNow: Date;

  beforeEach(() => {
    // Mock the current date to 2024-01-15 for consistent testing
    mockNow = new Date('2024-01-15T12:30:45.000Z');
    vi.useFakeTimers();
    vi.setSystemTime(mockNow);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('is_active=false', () => {
    it('returns true when is_active is false regardless of expires_date', () => {
      const listing = {
        is_active: false,
        expires_date: new Date('2025-12-31'),
      };

      expect(isExpired(listing)).toBe(true);
    });

    it('returns true when is_active is false and expires_date is null', () => {
      const listing = {
        is_active: false,
        expires_date: null,
      };

      expect(isExpired(listing)).toBe(true);
    });

    it('returns true when is_active is false and expires_date is in the past', () => {
      const listing = {
        is_active: false,
        expires_date: new Date('2023-01-01'),
      };

      expect(isExpired(listing)).toBe(true);
    });
  });

  describe('is_active=true with expires_date in the past', () => {
    it('returns true when expires_date is in the past', () => {
      const listing = {
        is_active: true,
        expires_date: new Date('2024-01-14'), // Yesterday
      };

      expect(isExpired(listing)).toBe(true);
    });

    it('returns true when expires_date is far in the past', () => {
      const listing = {
        is_active: true,
        expires_date: new Date('2023-06-15'),
      };

      expect(isExpired(listing)).toBe(true);
    });

    it('handles date-only comparison correctly regardless of time component', () => {
      // Create a date at 23:59:59 UTC on 2024-01-14 (yesterday)
      const expiryDate = new Date('2024-01-14T23:59:59.000Z');

      const listing = {
        is_active: true,
        expires_date: expiryDate,
      };

      expect(isExpired(listing)).toBe(true);
    });
  });

  describe('is_active=true with expires_date=null', () => {
    it('returns false when expires_date is null', () => {
      const listing = {
        is_active: true,
        expires_date: null,
      };

      expect(isExpired(listing)).toBe(false);
    });
  });

  describe('is_active=true with expires_date in the future', () => {
    it('returns false when expires_date is in the future', () => {
      const listing = {
        is_active: true,
        expires_date: new Date('2024-01-16'), // Tomorrow
      };

      expect(isExpired(listing)).toBe(false);
    });

    it('returns false when expires_date is far in the future', () => {
      const listing = {
        is_active: true,
        expires_date: new Date('2025-12-31'),
      };

      expect(isExpired(listing)).toBe(false);
    });

    it('handles date-only comparison correctly regardless of time component', () => {
      // Create a date at 00:00:00 UTC on 2024-01-16 (tomorrow)
      const expiryDate = new Date('2024-01-16T00:00:00.000Z');

      const listing = {
        is_active: true,
        expires_date: expiryDate,
      };

      expect(isExpired(listing)).toBe(false);
    });

    it('returns false when expires_date is just after midnight tomorrow', () => {
      // Create a date at 00:00:01 UTC on 2024-01-16 (tomorrow)
      const expiryDate = new Date('2024-01-16T00:00:01.000Z');

      const listing = {
        is_active: true,
        expires_date: expiryDate,
      };

      expect(isExpired(listing)).toBe(false);
    });
  });

  describe('edge case: expires_date on the same day as today', () => {
    it('returns false when expires_date is today (date-only comparison)', () => {
      // Create a date for today (2024-01-15)
      const expiryDate = new Date('2024-01-15T12:00:00.000Z');

      const listing = {
        is_active: true,
        expires_date: expiryDate,
      };

      // Should return false because the expiry date (2024-01-15) is NOT < today (2024-01-15)
      expect(isExpired(listing)).toBe(false);
    });

    it('returns false when expires_date is today at 23:59:59 UTC', () => {
      const expiryDate = new Date('2024-01-15T23:59:59.000Z');

      const listing = {
        is_active: true,
        expires_date: expiryDate,
      };

      expect(isExpired(listing)).toBe(false);
    });

    it('returns true when expires_date is yesterday at 23:59:59 UTC', () => {
      const expiryDate = new Date('2024-01-14T23:59:59.000Z');

      const listing = {
        is_active: true,
        expires_date: expiryDate,
      };

      expect(isExpired(listing)).toBe(true);
    });
  });

  describe('UTC date-only comparison (timezone handling)', () => {
    it('uses UTC hours for date-only comparison', () => {
      // Create a date that's in different timezone representations
      const expiryDate = new Date('2024-01-14T23:00:00Z'); // Jan 14 in UTC

      const listing = {
        is_active: true,
        expires_date: expiryDate,
      };

      // Current mock time is 2024-01-15T12:30:45Z
      // Expiry date as UTC date-only is 2024-01-14
      // Today as UTC date-only is 2024-01-15
      // 2024-01-14 < 2024-01-15, so should be expired
      expect(isExpired(listing)).toBe(true);
    });
  });

  describe('type safety', () => {
    it('accepts an object with is_active boolean and expires_date Date|null', () => {
      const listing1 = {
        is_active: true,
        expires_date: null,
      };

      const listing2 = {
        is_active: false,
        expires_date: new Date('2024-12-31'),
      };

      expect(() => {
        isExpired(listing1);
        isExpired(listing2);
      }).not.toThrow();
    });
  });
});
