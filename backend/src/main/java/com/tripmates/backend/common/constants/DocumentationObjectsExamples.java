package com.tripmates.backend.common.constants;

public class DocumentationObjectsExamples {

	static public final String BUSINESS_PUBLICATION_EXAMPLE = """
			Creates a new business publication with the provided data and optional images.

			### Request Structure
			- `data`: (required) JSON with the publication data.
			- `files`: (optional) Image files for the publication (JPG, PNG, etc.).

			### Required Fields
			- `title`: Publication title (cannot be empty)
			- `description`: Business publication description (cannot be empty)

			### Optional Fields
			- `phoneNumber`: Business contact number
			- `email`: Business contact email (must be valid email format)
			- `location`: Business physical location
			- `openingDays`: List of business opening days (e.g., ["MONDAY", "TUESDAY"])
			- `attentionSchedule`: Object containing `openingTime` and `closingTime` in HH:MM format
			- `exceptionalClosingDays`: List of dates when business is closed (YYYY-MM-DD format)
			- `tags`: List of tags to categorize the business

			### Example Request
			```json
			{
			  "title": "Mountain lodge",
			  "description": "Beautiful place with amazing views and full amenities.",
			  "phoneNumber": "+541112345678",
			  "email": "contact@hostel.com",
			  "location": "San Carlos de Bariloche, Argentina",
			  "openingDays": ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
			  "attentionSchedule": { "openingTime": "09:00", "closingTime": "18:00" },
			  "exceptionalClosingDays": ["2025-12-25", "2025-01-01"],
			  "tags": ["hostel", "mountain", "nature"]
			}
			```""";

	static public final String BUSINESS_PUBLICATION_UPDATE_EXAMPLE = """
			Updates an existing publication with JSON data and optional images.

			Multipart request structure:
			- `data`: (required) JSON with the fields to update.
			- `files`: (optional) Images for the publication (JPG, PNG, etc.).

			Example JSON for the `data` part:
			```json
			{
			  "title": "New title",
			  "description": "Updated description",
			  "phoneNumber": "+541112345678",
			  "email": "contact@hostel.com",
			  "location": "123 Address, City",
			  "openingDays": ["MONDAY", "TUESDAY"],
			  "attentionSchedule": { "openingTime": "09:00", "closingTime": "18:00" },
			  "exceptionalClosingDays": ["2025-12-25"]
			}
			```""";

	static public final String BUSINESS_PUBLICATION_SEARCH_EXAMPLE = """
			Filters are received as query params via model attributes.

			Parameters:
			- q: Full-text search across title and description (case-insensitive).
			- location: Partial match (case-insensitive).
			- tags: Publication must contain all provided tags.
			- ownerId: Filter by owner id.
			- page, size, sort: Pagination (e.g., sort=createdAt,desc).""";

	static public final String UPDATE_PROFILE_EXAMPLE = """
			Updates an existing business with the provided data. All fields are optional.

			### Request Structure
			- `data`: (required) JSON with the fields to update.
			- `files`: (optional) New image files for the business (JPG, PNG, etc.), these are added to the existing images.

			### Updatable Fields
			- `name`: Business name
			- `description`: Business description
			- `restaurantType`: Type of restaurant (e.g., ITALIAN, MEXICAN, etc.)
			- `location`: Business address
			- `phoneNumber`: Contact number
			- `publicEmail`: Public contact email
			- `averagePrice`: Price range (e.g., "$", "$$", "$$$")
			- `attentionSchedule`: Object with `openingTime` and `closingTime` in "HH:mm" format
			- `openingDays`: Array of days the business is open (e.g., ["MONDAY", "TUESDAY"])
			- `imageUrlsToDelete`: Array of image URLs to delete from the business's profile photos collection (e.g., ["https://example.com/image1.jpg", "https://example.com/image2.jpg"]).

			### Example Request (for Restaurant Type)
			```json
			{
			  "name": "Updated Restaurant Name",
			  "description": "Updated description with new details about our services.",
			  "restaurantType": "ITALIAN",
			  "location": "456 New Street, City, Country",
			  "phoneNumber": "+541119876543",
			  "publicEmail": "new-email@restaurant.com",
			  "averagePrice": "$$$",
			  "attentionSchedule": {
			    "openingTime": "10:00",
			    "closingTime": "23:00"
			  },
			  "openingDays": ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"],
			  "imageUrlsToDelete": []
			}
			```
			""";

}
