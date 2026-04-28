/**
 * Zod validation schemas for listing detail page
 * 
 * These schemas validate:
 * - ListingIdSchema: UUID path parameter validation for [id] route segments
 * - ApplyUrlSchema: URL validation for the apply_url field before rendering apply button
 */

import { z } from 'zod';

/**
 * Schema for validating listing IDs in path parameters
 * Ensures the [id] is a valid UUID v4
 */
export const ListingIdSchema = z.string().uuid('Invalid listing ID format');

/**
 * Schema for validating apply_url field values
 * Ensures the URL is a valid, properly formatted URL
 */
export const ApplyUrlSchema = z.string().url('Invalid URL format');

/**
 * Type inference from ApplyUrlSchema for type safety
 */
export type ApplyUrl = z.infer<typeof ApplyUrlSchema>;

/**
 * Type inference from ListingIdSchema for type safety
 */
export type ListingId = z.infer<typeof ListingIdSchema>;
