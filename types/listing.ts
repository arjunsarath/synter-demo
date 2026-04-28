import { Prisma } from '@prisma/client';

/**
 * ListingWithTags - A Prisma-derived type for a listing record that includes
 * the listing_tags relation with nested tag data.
 *
 * Used in the detail page to render the full listing with all associated tags.
 * Derived using Prisma.ListingGetPayload with the relevant include shape.
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
 * Contains only the fields needed for JobCard rendering:
 * - id: UUID identifier for linking
 * - title: job title for card display
 * - company: company name
 * - location: job location
 * - posted_date: posting date for metadata
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
 * Extract the nested tag type from ListingWithTags for convenience.
 * Used when passing individual tags to components.
 */
export type ListingTag = ListingWithTags['listing_tags'][number];

export type TagData = ListingTag['tag'];
