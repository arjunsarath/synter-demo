import { Prisma } from '@prisma/client';

/**
 * ListingWithTags - A Prisma-derived type for a listing record that includes
 * the listing_tags relation with nested tag data.
 *
 * This type is the canonical representation of a listing for the detail page.
 * Derived from Prisma.ListingGetPayload with the relevant include shape that
 * matches the query structure in getListingById() to ensure type-safety and
 * prevent schema drift.
 * 
 * Used in the detail page to render the full listing with all associated tags.
 * Exported return type for lib/listings.ts helper functions.
 */
export type ListingWithTags = Prisma.ListingGetPayload<{
  include: {
    listing_tags: {
      include: {
        tag: true;
      };
    };
  };
}>;

/**
 * RelatedListing - A leaner subset type for rendering JobCards in the
 * Related Jobs section.
 *
 * This type is explicitly defined (not inferred from Prisma) to represent
 * the minimal fields needed for JobCard rendering. It mirrors the select
 * shape used in getRelatedListings() to ensure the data fetched matches
 * what components expect, preventing silent type mismatches.
 *
 * Contains only the fields needed for JobCard rendering:
 * - id: UUID identifier for linking
 * - title: job title for card display
 * - company: company name
 * - location: job location (nullable)
 * - posted_date: posting date for metadata (nullable)
 * - tags: array of tag data for tag chips
 */
export type RelatedListing = {
  id: string;
  title: string;
  company: string;
  location: string | null;
  posted_date: Date | null;
  tags: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
};

/**
 * ListingTag - Helper type extracted from ListingWithTags for convenience.
 * 
 * Represents a single listing_tags join record: { tag: { id, name, slug, ... } }
 * Used when passing individual tag relations to components that need the full
 * structure of the join.
 */
export type ListingTag = ListingWithTags['listing_tags'][number];

/**
 * TagData - Helper type extracted from ListingTag for tag-only scenarios.
 * 
 * Represents just the tag data without the join wrapper: { id, name, slug, ... }
 * Used in the tags array of RelatedListing and when only tag metadata is needed
 * by components like TagChip.
 */
export type TagData = ListingTag['tag'];
