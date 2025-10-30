package com.tripmates.backend.common.constants;

public class DocumentationObjectsExamples {

	static public final String BUSINESS_PUBLICATION_EXAMPLE = "Creates a new business publication with the provided data and optional images.\n\n"
			+ "### Request Structure\n" + "- `data`: (required) JSON with the publication data.\n"
			+ "- `files`: (optional) Image files for the publication (JPG, PNG, etc.).\n\n" + "### Required Fields\n"
			+ "- `title`: Publication title (cannot be empty)\n"
			+ "- `description`: Business publication description (cannot be empty)\n\n" + "### Optional Fields\n"
			+ "- `phoneNumber`: Business contact number\n"
			+ "- `email`: Business contact email (must be valid email format)\n"
			+ "- `location`: Business physical location\n"
			+ "- `openingDays`: List of business opening days (e.g., [\"MONDAY\", \"TUESDAY\"])\n"
			+ "- `attentionSchedule`: Object containing `openingTime` and `closingTime` in HH:MM format\n"
			+ "- `exceptionalClosingDays`: List of dates when business is closed (YYYY-MM-DD format)\n"
			+ "- `tags`: List of tags to categorize the business\n\n" + "### Example Request\n" + "```json\n" + "{\n"
			+ "  \"title\": \"Mountain lodge\",\n"
			+ "  \"description\": \"Beautiful place with amazing views and full amenities.\",\n"
			+ "  \"phoneNumber\": \"+541112345678\",\n" + "  \"email\": \"contact@hostel.com\",\n"
			+ "  \"location\": \"San Carlos de Bariloche, Argentina\",\n"
			+ "  \"openingDays\": [\"MONDAY\", \"TUESDAY\", \"WEDNESDAY\", \"THURSDAY\", \"FRIDAY\"],\n"
			+ "  \"attentionSchedule\": { \"openingTime\": \"09:00\", \"closingTime\": \"18:00\" },\n"
			+ "  \"exceptionalClosingDays\": [\"2025-12-25\", \"2025-01-01\"],\n"
			+ "  \"tags\": [\"hostel\", \"mountain\", \"nature\"]\n" + "}\n" + "```";

	static public final String UPDATE_PROFILE_EXAMPLE = """
			Updates an existing business with the provided data. All fields are optional.

			### Request Structure
			- `data`: (required) JSON with the fields to update.
			- `files`: (optional) New image files for the business (JPG, PNG, etc.).

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
			  "openingDays": ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"]
			}
			```
			""";
}
