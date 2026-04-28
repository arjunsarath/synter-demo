/**
 * Utility functions for job listings
 */

/**
 * Determines if a listing has expired
 * 
 * A listing is considered expired if:
 * - is_active is false, OR
 * - expires_date is not null AND expires_date (UTC date-only) is in the past
 * 
 * A null expires_date does NOT trigger the expired state.
 * Date comparison is performed as UTC date-only (not datetime, not timezone-aware).
 * 
 * @param listing - Object containing is_active and expires_date
 * @returns true if the listing has expired, false otherwise
 */
export function isExpired(listing: {
  is_active: boolean;
  expires_date: Date | null;
}): boolean {
  // If is_active is false, the listing is expired
  if (!listing.is_active) {
    return true;
  }

  // If expires_date is null, the listing is NOT expired
  if (listing.expires_date === null) {
    return false;
  }

  // Compare dates as UTC date-only (no time component)
  const expiryDateOnly = new Date(listing.expires_date);
  expiryDateOnly.setUTCHours(0, 0, 0, 0);

  const todayDateOnly = new Date();
  todayDateOnly.setUTCHours(0, 0, 0, 0);

  // Listing is expired if expires_date is before today
  return expiryDateOnly < todayDateOnly;
}
