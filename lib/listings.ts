/**
 * Utility functions for job listings
 */

import { cache } from 'react';
import { prisma } from '@/lib/db';
import type { ListingWithTags, RelatedListing } from '@/types/listing';

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

/**
 * Fetches a single listing by ID with all associated tags
 * 
 * Wrapped in React's cache() to memoize within a single request cycle,
 * avoiding duplicate DB hits if called multiple times in the same render.
 * 
 * @param id - The UUID of the listing
 * @returns The listing with nested tags, or null if not found
 */
export const getListingById = cache(
  async (id: string): Promise<ListingWithTags | null> => {
    return prisma.listing.findUnique({
      where: { id },
      include: {
        listing_tags: {
          include: {
            tag: true,
          },
        },
      },
    });
  }
);

/**
 * Fetches related listings that share at least one tag with the given listing
 * 
 * Returns up to `take` active listings (is_active=true) that:
 * - Share at least one tag with the given listing (matched by tagIds)
 * - Exclude the current listing (by ID)
 * - Are sorted by posted_date DESC (most recent first)
 * 
 * Wrapped in React's cache() to memoize within a single request cycle.
 * 
 * @param listingId - The UUID of the current listing (to be excluded from results)
 * @param tagIds - Array of tag IDs associated with the current listing
 * @param take - Maximum number of related listings to return (default: 3)
 * @returns Array of related listings with minimal fields needed for JobCard rendering
 */
export const getRelatedListings = cache(
  async (
    listingId: string,
    tagIds: string[],
    take = 3
  ): Promise<RelatedListing[]> => {
    // If no tags exist on the current listing, no related listings can be found
    if (tagIds.length === 0) {
      return [];
    }

    const listings = await prisma.listing.findMany({
      where: {
        // Exclude the current listing
        NOT: { id: listingId },
        // Only include active listings
        is_active: true,
        // Include listings that have at least one tag matching the current listing's tags
        listing_tags: {
          some: {
            tag: {
              id: {
                in: tagIds,
              },
            },
          },
        },
      },
      select: {
        id: true,
        title: true,
        company: true,
        location: true,
        posted_date: true,
        listing_tags: {
          select: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: {
        posted_date: 'desc',
      },
      take,
    });

    // Transform the result to match RelatedListing type
    // Map listing_tags to a flat tags array
    return listings.map((listing) => ({
      id: listing.id,
      title: listing.title,
      company: listing.company,
      location: listing.location,
      posted_date: listing.posted_date,
      tags: listing.listing_tags.map((lt) => lt.tag),
    }));
  }
);
