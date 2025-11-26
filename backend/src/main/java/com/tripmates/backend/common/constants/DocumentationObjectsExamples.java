package com.tripmates.backend.common.constants;

public class DocumentationObjectsExamples {

	/**
 * Example JSON for business publication creation
 */
public static final String BUSINESS_PUBLICATION_EXAMPLE = "{\n" +
        "  \"title\": \"Mountain lodge\",\n" +
        "  \"description\": \"Beautiful place with amazing views and full amenities.\",\n" +
        "  \"phoneNumber\": \"+541112345678\",\n" +
        "  \"email\": \"contact@hostel.com\",\n" +
        "  \"address\": \"Ruta 234, San Carlos de Bariloche\",\n  \"latitude\": -41.1335,\n  \"longitude\": -71.3103,\n" +
        "  \"openingDays\": [\"MONDAY\", \"TUESDAY\", \"WEDNESDAY\", \"THURSDAY\", \"FRIDAY\"],\n" +
        "  \"attentionSchedule\": {\n" +
        "    \"openingTime\": \"09:00\",\n" +
        "    \"closingTime\": \"18:00\"\n" +
        "  },\n" +
        "  \"exceptionalClosingDays\": [\"2025-12-25\", \"2025-01-01\"],\n" +
        "  \"tags\": [\"hostel\", \"mountain\", \"nature\"]\n" +
        "}";

	/**
	 * Example JSON for business publication update
	 */
	public static final String BUSINESS_PUBLICATION_UPDATE_EXAMPLE = "{\n" +
	        "  \"title\": \"New title\",\n" +
	        "  \"description\": \"Updated description\",\n" +
	        "  \"phoneNumber\": \"+541112345678\",\n" +
	        "  \"email\": \"contact@hostel.com\",\n" +
	        "  \"address\": \"Ruta 234, San Carlos de Bariloche\",\n  \"latitude\": -41.1335,\n  \"longitude\": -71.3103,\n" +
	        "  \"openingDays\": [\"MONDAY\", \"TUESDAY\"],\n" +
	        "  \"attentionSchedule\": {\n" +
	        "    \"openingTime\": \"09:00\",\n" +
	        "    \"closingTime\": \"18:00\"\n" +
	        "  },\n" +
	        "  \"exceptionalClosingDays\": [\"2025-12-25\"],\n" +
	        "  \"deletePhotoIndexes\": [0, 2]\n" +
	        "}";

	static public final String BUSINESS_PUBLICATION_SEARCH_EXAMPLE = """
			Filters are received as query params via model attributes.

			Parameters:
			- q: Full-text search across title and description (case-insensitive).
			- location: Partial match (case-insensitive).
			- tags: Publication must contain all provided tags.
			- ownerId: Filter by owner id.
			- page, size, sort: Pagination (e.g., sort=createdAt,desc).""";

	static public final String CREATE_REVIEW_EXAMPLE = """
			Creates a new review for a publication.

			### Request Structure
			- `data`: (required) JSON with the review details.
			- `files`: (optional) Image files to include with the review (JPG, PNG, etc.).
			- `publicationId`: (path variable) ID of the publication being reviewed.

			### Required Fields
			- `title`: Title of the review (non-blank string)
			- `content`: Detailed review content (non-blank string)
			- `rating`: Numeric rating between 0.5 and 5.0 (inclusive)

			### Example Request
			```json
			{
			  "title": "Amazing experience!",
			  "content": "Had a wonderful time at this place. The staff was very friendly and the food was delicious.",
			  "rating": 4.5
			}
			```

			### Response
			- Status: 201 Created
			- Body: The created review details in `ReviewResponseDTO` format
			""";

	static public final String UPDATE_PROFILE_EXAMPLE = """
			Updates an existing business with the provided data. All fields are optional.

			### Request Structure
			- `data`: (required) JSON with the fields to update.
			- `files`: (optional) New image files for the business (JPG, PNG, etc.), these are added to the existing images.

			### Updatable Fields
			- `name`: Business name
			- `description`: Business description
			- `restaurantType`: Type of restaurant (e.g., Italiano, Argentino, etc.)
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
			  "restaurantType": "Italiano",
			  "location": {
					"address": "Ruta 234, San Carlos de Bariloche",
					"latitude": -41.1335,
					"longitude": -71.3103
				},
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
			- `data`: (optional) JSON with non-image fields (foodName, price, description) and `deletePhotoIndexes` to remove specific photos by 0-based indexes. If omitted, only photos are modified.
			- `files`: (optional) New images to append.

			### Example data (JSON)
			```json
			{
			  "foodName": "Triple Burger",
			  "price": 11.5,
			  "description": "With cheddar",
			  "deletePhotoIndexes": [0, 2]
			}
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
			- `data`: (optional) JSON with non-image fields and `deletePhotoIndexes` to remove specific photos by 0-based indexes. If omitted, only photos are modified.
			- `files`: (optional) New images to append.

			### Example data (JSON)
			```json
			{
			  "checkInDate": "2025-11-15",
			  "checkOutDate": "2025-11-18",
			  "numberOfGuests": 3,
			  "services": ["breakfast", "gym"],
			  "price": 310.0,
			  "description": "Premium suite",
			  "deletePhotoIndexes": [1]
			}
			```
			""";
	static public final String USER_PLAN_CREATION = """
			Creates a new user plan. Some fields are optional, some are not (more to arrive soon).
			### Request Structure
			- `planCreationRequestDTO`: (required) DTO with the plan details.
			### PlanCreationRequestDTO fields
			- `name`: Plan's name
			- `description`: Plan's description
			- `publications`: Publications ID
			### Example Request (for Restaurant Type)
			```json
			{
			  "name": "My Best Holidays",
			  "description": "Europe christmas holidays trip!",
			  "publications": []
			}
			```
			""";

	static public final String USER_PLAN_UPDATE_EXAMPLE = """
			Partially updates a user's plan by its id.

			### Behavior
			- Optional fields: `name`, `description`.
			- `publicationsIdList`: appended to the existing publications list (no replacement).
			- `deletePublicationIndexes`: 0-based indexes to remove from the current publications list.

			### Example JSON (PATCH body)
			```json
			{
			  "name": "Road trip 2026",
			  "description": "Costa atlántica",
			  "publicationsIdList": ["11111111111", "22222222222"],
			  "deletePublicationIndexes": [0, 2]
			}
			```
			""";

	public static final String USER_ACCOUNT_SEARCH_EXAMPLE = """
			Search a user account by the filters provided.

			### Filters
			- `username`: Filters by user's username.
			- `followers`: Filters by this minimum amount of followers.
			- `following`: Filters by this minimum amount of followings.
			- `address`: Filters by users that have made a review from a business publication that has
			this specific location address.

			### Example Request
			```json
			{
			    "username": "string",
			    "followers": 0,
			    "following": 0,
			    "address": "string"
			}
			```

			### Returns
			This endpoint returns the following JSON.
			```json
			          {
			              "id": "string",
			              "avatarURL": "string",
			              "name": "string",
			              "email": "string",
			              "role": "USER",
			              "description": "string"
			          }
			```
			""";

	public static final String BUSINESS_ACCOUNT_SEARCH_EXAMPLE = """
				Search a business account by the filters provided.

				### Filters
				- `username`: Filters by business's username.
				- `averagePrice`: Filters by the average price.
				- `location`: Filters by business's location.
				- `businessType`: Filter by the business type.
				- `restaurantType`: Filter by the restaurant type.
				- `hotelType`: Filter by the hotel type.
				- `attentionSchedule`: Filter by the attention schedule.
				    - `openingTime`: Filter by the opening time.
				    - `closingTime`: Filter by the closing time.
				- `roomPacksList`: Filter by business hosting room packs.
				    - `numberOfGuests`: Filter by number of guests.
				    - `checkInDate`: Filter by the checkin date.
				    - `checkOutDate`: Filter by the checkout date.

				### Example Request
				```json
				         {
				              "username": "string",
				              "businessType": "RESTAURANT",
				              "location": {
				                "address": "string",
				                "latitude": 0,
				                "longitude": 0
				              },
				              "averagePrice": "$",
				              "restaurantType": "Cafe",
				              "attentionSchedule": {
				                  "openingTime": {
				                      "hour": 0,
				                      "minute": 0,
				                      "second": 0,
				                      "nano": 0
				                  },
				                  "closingTime": {
				                      "hour": 0,
				                      "minute": 0,
				                      "second": 0,
				                      "nano": 0
				                  }
				              },
				              "hotelType": "Hotel",
				              "roomPacks": [
				                 {
				                     "checkInDate": "2025-11-10",
				                     "checkOutDate": "2025-11-10",
				                     "numberOfGuests": 0,
				                 }
				              ]
				          }
				```

				### Returns
				This endpoint returns the following JSON.
				```json
				          {
				              "id": "string",
				              "avatarURL": "string",
				              "name": "string",
				              "email": "string",
				              "role": "BUSINESS",
				              "description": "string",
				              "businessType": "RESTAURANT",
				              "location": {
				                "address": "string",
				                "latitude": 0,
				                "longitude": 0
				              },
				              "phoneNumber": "string",
				              "publicEmail": "string",
				              "profileImageUrls": [
				                  "string"
				              ],
				              "averagePrice": "$",
				              "restaurantType": "Cafe",
				              "attentionSchedule": {
				                  "openingTime": {
				                      "hour": 0,
				                      "minute": 0,
				                      "second": 0,
				                      "nano": 0
				                  },
				                  "closingTime": {
				                      "hour": 0,
				                      "minute": 0,
				                      "second": 0,
				                      "nano": 0
				                  }
				              },
				              "openingDays": [
				                  "MONDAY"
				              ],
				              "menu": [
				                 {
				                     "photosURLs": [
				                        "string"
				                     ],
				                     "foodName": "string",
				                     "price": 0,
				                     "description": "string"
				                 }
				              ],
				              "hotelType": "Hotel",
				              "roomPacks": [
				                 {
				                     "checkInDate": "2025-11-10",
				                     "checkOutDate": "2025-11-10",
				                     "numberOfGuests": 0,
				                     "services": [
				                         "string"
				                     ],
				                     "price": 0,
				                     "description": "string",
				                     "photosURLs": [
				                         "string"
				                     ]
				                 }
				              ]
				          }
				```
				""";

	public static final String USER_HISTORY_LIKES = """
			         Returns the publications where the user has left a like.

			         ### Example Request
			         Should just use this endpoint
			         ```
			         /users/history/likes/{userId}
			         ```

			         ### Example Response
			         This endpoint returns the following JSON.
			```json
			         [
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
			             },
			             ...
			         ]
			```
			""";

}
