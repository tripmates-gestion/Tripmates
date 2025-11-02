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

    // Restaurant (Menu Items)
    static public final String RESTAURANT_APPEND_EXAMPLE = """
            Appends one menu item with optional images.

            ### Request Structure
            - `data`: (required) JSON with non-image fields (foodName, price, description)
            - `files`: (optional) Image files (JPG, PNG, etc.). Images are uploaded only via 'files'.

            ### Example data (JSON)
            ```json
            {
              "foodName": "Double Burger",
              "price": 9.99,
              "description": "With cheddar and bacon"
            }
            ```
            """;

    static public final String RESTAURANT_UPDATE_EXAMPLE = """
            Partially updates one menu item by index.

            ### Request Structure
            - `data`: (optional) JSON with non-image fields (foodName, price, description). If omitted, only photos are modified.
            - `files`: (optional) New images to append.
            - `deletePhotoIndexes`: (optional) 0-based indexes of existing photos to remove.

            ### Example data (JSON)
            ```json
            {
              "foodName": "Triple Burger",
              "price": 11.5,
              "description": "With cheddar"
            }
            ```

            ### Example deletePhotoIndexes (JSON array)
            ```json
            [0, 2]
            ```
            """;

    // Hosting (Room Packs)
    static public final String HOSTING_APPEND_EXAMPLE = """
            Appends one room pack with optional images.

            ### Request Structure
            - `data`: (required) JSON with non-image fields (checkInDate, checkOutDate, numberOfGuests, services, price, description)
            - `files`: (optional) Image files (JPG, PNG, etc.). Images are uploaded only via 'files'.

            ### Example data (JSON)
            ```json
            {
              "checkInDate": "2025-11-10",
              "checkOutDate": "2025-11-12",
              "numberOfGuests": 2,
              "services": ["breakfast", "pool"],
              "price": 250.0,
              "description": "Suite with sea view"
            }
            ```
            """;

    static public final String HOSTING_UPDATE_EXAMPLE = """
            Partially updates one room pack by index.

            ### Request Structure
            - `data`: (optional) JSON with non-image fields. If omitted, only photos are modified.
            - `files`: (optional) New images to append.
            - `deletePhotoIndexes`: (optional) 0-based indexes of existing photos to remove.

            ### Example data (JSON)
            ```json
            {
              "checkInDate": "2025-11-15",
              "checkOutDate": "2025-11-18",
              "numberOfGuests": 3,
              "services": ["breakfast", "gym"],
              "price": 310.0,
              "description": "Premium suite"
            }
            ```

            ### Example deletePhotoIndexes (JSON array)
            ```json
            [1]
            ```
            """;

}
