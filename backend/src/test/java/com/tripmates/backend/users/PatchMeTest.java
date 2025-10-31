package com.tripmates.backend.users;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.test.context.ActiveProfiles;

import com.tripmates.backend.config.TestCloudinaryConfig;

import java.nio.charset.StandardCharsets;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import com.tripmates.backend.common.constants.ValidationErrorMessage;
import com.tripmates.backend.common.types.BusinessType;

import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.BeforeAll;
import com.tripmates.backend.TestHelper;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@AutoConfigureMockMvc
@Import({ TestCloudinaryConfig.class })
public class PatchMeTest {

        @LocalServerPort
        private int port;

        private TestHelper testHelper;

        @Autowired
        private TestRestTemplate restTemplate;

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private MongoTemplate mongoTemplate;

        @BeforeAll
        void setUp() {
                testHelper = new TestHelper(port, restTemplate);
        }

        @BeforeEach
        void beforeEach() {
                mongoTemplate.getDb().drop();
                restTemplate.getRestTemplate().setRequestFactory(new HttpComponentsClientHttpRequestFactory());
        }

        @Test
        void testGivenNoJwt_WhenPatchMe_ThenShouldFailAndReturnError403Forbidden() throws Exception {
                String requestJson = """
                                {
                                  "name": "Beautiful place with amazing views and full amenities.",
                                  "description": "Beautiful place with amazing views and full amenities.",
                                  "phoneNumber": "+541112345678",
                                  "location": "contact@hostel.com",
                                  "phoneNumber": "+541112345678",
                                  "publicEmail": "contact@hostel.com",
                                  "averagePrice": "$$",
                                  "restaurantType": "Comida peruana",
                                  "attentionSchedule": {
                                      "openingTime": "09:00",
                                      "closingTime": "18:00"
                                  },
                                  "openingDays": ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
                                }
                                """;

                MockMultipartFile dataPart = new MockMultipartFile("data", "", "application/json",
                                requestJson.getBytes(StandardCharsets.UTF_8));

                mockMvc.perform(multipart("/users/me")
                                .file(dataPart)
                                .with(request -> {
                                        request.setMethod("PATCH"); // 🔹 fuerza el método PATCH
                                        return request;
                                }))
                                .andExpect(status().isForbidden())
                                .andDo(print());

        }

        @Test
        void testGivenRestaurantAccount_WhenPatchMeWithHotelField_ThenShouldFailAndReturnError400BadRequest()
                        throws Exception {
                String jwt = testHelper.getBusinessTestingJwt("test@example.com", BusinessType.RESTAURANT);
                String requestJson = """
                                {
                                  "hotelType": "Hotel de lujo"
                                }
                                """;

                MockMultipartFile dataPart = new MockMultipartFile("data", "", "application/json",
                                requestJson.getBytes(StandardCharsets.UTF_8));

                mockMvc.perform(multipart("/users/me")
                                .file(dataPart)
                                .with(request -> {
                                        request.setMethod("PATCH");
                                        return request;
                                }).header("Authorization", "Bearer " + jwt))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.type").value("about:blank"))
                                .andExpect(jsonPath("$.title").value("Bad Request"))
                                .andExpect(jsonPath("$.status").value(400))
                                .andExpect(jsonPath("$.detail").value(ValidationErrorMessage.NOT_HOTEL_ACCOUNT))
                                .andExpect(jsonPath("$.instance").value("/users/me"))
                                .andDo(print());
        }

        @Test
        void testGivenHotelAccount_WhenPatchMeWithRestaurantType_ThenShouldFailAndReturnError400BadRequest()
                        throws Exception {
                String jwt = testHelper.getBusinessTestingJwt("test@example.com",
                                BusinessType.HOTEL);
                String requestJson = """
                                {
                                "restaurantType": "Comida peruana"
                                }
                                """;

                MockMultipartFile dataPart = new MockMultipartFile("data", "",
                                "application/json",
                                requestJson.getBytes(StandardCharsets.UTF_8));

                mockMvc.perform(multipart("/users/me")
                                .file(dataPart)
                                .with(request -> {
                                        request.setMethod("PATCH");
                                        return request;
                                }).header("Authorization", "Bearer " + jwt))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.type").value("about:blank"))
                                .andExpect(jsonPath("$.title").value("Bad Request"))
                                .andExpect(jsonPath("$.status").value(400))
                                .andExpect(jsonPath("$.detail").value(ValidationErrorMessage.NOT_RESTAURANT_ACCOUNT))
                                .andExpect(jsonPath("$.instance").value("/users/me"))
                                .andDo(print());
        }

        @Test
        void testGivenHotelAccount_WhenPatchMeWithRestaurantAttentionSchedule_ThenShouldFailAndReturnError400BadRequest()
                        throws Exception {
                String jwt = testHelper.getBusinessTestingJwt("test@example.com",
                                BusinessType.HOTEL);
                String requestJson = """
                                {
                                "attentionSchedule": {
                                    "openingTime": "09:00",
                                    "closingTime": "18:00"
                                }
                                }
                                """;

                MockMultipartFile dataPart = new MockMultipartFile("data", "",
                                "application/json",
                                requestJson.getBytes(StandardCharsets.UTF_8));

                mockMvc.perform(multipart("/users/me")
                                .file(dataPart)
                                .with(request -> {
                                        request.setMethod("PATCH");
                                        return request;
                                }).header("Authorization", "Bearer " + jwt))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.type").value("about:blank"))
                                .andExpect(jsonPath("$.title").value("Bad Request"))
                                .andExpect(jsonPath("$.status").value(400))
                                .andExpect(jsonPath("$.detail").value(ValidationErrorMessage.NOT_RESTAURANT_ACCOUNT))
                                .andExpect(jsonPath("$.instance").value("/users/me"))
                                .andDo(print());
        }

        @Test
        void testGivenHotelAccount_WhenPatchMeWithRestaurantOpeningDays_ThenShouldFailAndReturnError400BadRequest()
                        throws Exception {
                String jwt = testHelper.getBusinessTestingJwt("test@example.com",
                                BusinessType.HOTEL);
                String requestJson = """
                                {
                                "openingDays": ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"]
                                }
                                """;

                MockMultipartFile dataPart = new MockMultipartFile("data", "",
                                "application/json",
                                requestJson.getBytes(StandardCharsets.UTF_8));

                mockMvc.perform(multipart("/users/me")
                                .file(dataPart)
                                .with(request -> {
                                        request.setMethod("PATCH");
                                        return request;
                                }).header("Authorization", "Bearer " + jwt))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.type").value("about:blank"))
                                .andExpect(jsonPath("$.title").value("Bad Request"))
                                .andExpect(jsonPath("$.status").value(400))
                                .andExpect(jsonPath("$.detail").value(ValidationErrorMessage.NOT_RESTAURANT_ACCOUNT))
                                .andExpect(jsonPath("$.instance").value("/users/me"))
                                .andDo(print());
        }

        /* *************AHORA PARA USUARIO************************* */

        @Test
        void testGivenUserAccount_WhenPatchMeWithHotelType_ThenShouldFailAndReturnError400BadRequest()
                        throws Exception {
                String jwt = testHelper.getUserTestingJwt("test@example.com");
                String requestJson = """
                                {
                                "hotelType": "Comida peruana"
                                }
                                """;

                MockMultipartFile dataPart = new MockMultipartFile("data", "",
                                "application/json",
                                requestJson.getBytes(StandardCharsets.UTF_8));

                mockMvc.perform(multipart("/users/me")
                                .file(dataPart)
                                .with(request -> {
                                        request.setMethod("PATCH");
                                        return request;
                                }).header("Authorization", "Bearer " + jwt))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.type").value("about:blank"))
                                .andExpect(jsonPath("$.title").value("Bad Request"))
                                .andExpect(jsonPath("$.status").value(400))
                                .andExpect(jsonPath("$.detail").value(ValidationErrorMessage.NOT_BUSINESS_ACCOUNT))
                                .andExpect(jsonPath("$.instance").value("/users/me"))
                                .andDo(print());
        }

        @Test
        void testGivenUserAccount_WhenPatchMeWithRestaurantType_ThenShouldFailAndReturnError400BadRequest()
                        throws Exception {
                String jwt = testHelper.getUserTestingJwt("test@example.com");
                String requestJson = """
                                {
                                "restaurantType": "Comida peruana"
                                }
                                """;

                MockMultipartFile dataPart = new MockMultipartFile("data", "",
                                "application/json",
                                requestJson.getBytes(StandardCharsets.UTF_8));

                mockMvc.perform(multipart("/users/me")
                                .file(dataPart)
                                .with(request -> {
                                        request.setMethod("PATCH");
                                        return request;
                                }).header("Authorization", "Bearer " + jwt))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.type").value("about:blank"))
                                .andExpect(jsonPath("$.title").value("Bad Request"))
                                .andExpect(jsonPath("$.status").value(400))
                                .andExpect(jsonPath("$.detail").value(ValidationErrorMessage.NOT_BUSINESS_ACCOUNT))
                                .andExpect(jsonPath("$.instance").value("/users/me"))
                                .andDo(print());
        }

        @Test
        void testGivenUserAccount_WhenPatchMeWithRestaurantAttentionSchedule_ThenShouldFailAndReturnError400BadRequest()
                        throws Exception {
                String jwt = testHelper.getUserTestingJwt("test@example.com");
                String requestJson = """
                                {
                                "attentionSchedule": {
                                    "openingTime": "09:00",
                                    "closingTime": "18:00"
                                }
                                }
                                """;

                MockMultipartFile dataPart = new MockMultipartFile("data", "",
                                "application/json",
                                requestJson.getBytes(StandardCharsets.UTF_8));

                mockMvc.perform(multipart("/users/me")
                                .file(dataPart)
                                .with(request -> {
                                        request.setMethod("PATCH");
                                        return request;
                                }).header("Authorization", "Bearer " + jwt))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.type").value("about:blank"))
                                .andExpect(jsonPath("$.title").value("Bad Request"))
                                .andExpect(jsonPath("$.status").value(400))
                                .andExpect(jsonPath("$.detail").value(ValidationErrorMessage.NOT_BUSINESS_ACCOUNT))
                                .andExpect(jsonPath("$.instance").value("/users/me"))
                                .andDo(print());
        }

        @Test
        void testGivenUserAccount_WhenPatchMeWithRestaurantOpeningDays_ThenShouldFailAndReturnError400BadRequest()
                        throws Exception {
                String jwt = testHelper.getUserTestingJwt("test@example.com");
                String requestJson = """
                                {
                                "openingDays": ["MONDAY", "TUESDAY", "WEDNESDAY"]
                                }
                                """;

                MockMultipartFile dataPart = new MockMultipartFile("data", "",
                                "application/json",
                                requestJson.getBytes(StandardCharsets.UTF_8));

                mockMvc.perform(multipart("/users/me")
                                .file(dataPart)
                                .with(request -> {
                                        request.setMethod("PATCH");
                                        return request;
                                }).header("Authorization", "Bearer " + jwt))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.type").value("about:blank"))
                                .andExpect(jsonPath("$.title").value("Bad Request"))
                                .andExpect(jsonPath("$.status").value(400))
                                .andExpect(jsonPath("$.detail").value(ValidationErrorMessage.NOT_BUSINESS_ACCOUNT))
                                .andExpect(jsonPath("$.instance").value("/users/me"))
                                .andDo(print());
        }

        @Test
        void testGivenUserAccount_WhenPatchMeWithPublicEmail_ThenShouldFailAndReturnError400BadRequest()
                        throws Exception {
                String jwt = testHelper.getUserTestingJwt("test@example.com");
                String requestJson = """
                                {
                                "publicEmail": "new@example.com"
                                }
                                """;

                MockMultipartFile dataPart = new MockMultipartFile("data", "",
                                "application/json",
                                requestJson.getBytes(StandardCharsets.UTF_8));

                mockMvc.perform(multipart("/users/me")
                                .file(dataPart)
                                .with(request -> {
                                        request.setMethod("PATCH");
                                        return request;
                                }).header("Authorization", "Bearer " + jwt))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.type").value("about:blank"))
                                .andExpect(jsonPath("$.title").value("Bad Request"))
                                .andExpect(jsonPath("$.status").value(400))
                                .andExpect(jsonPath("$.detail").value(ValidationErrorMessage.NOT_BUSINESS_ACCOUNT))
                                .andExpect(jsonPath("$.instance").value("/users/me"))
                                .andDo(print());
        }

        @Test
        void testGivenUserAccount_WhenPatchMeWithPhoneNumber_ThenShouldFailAndReturnError400BadRequest()
                        throws Exception {
                String jwt = testHelper.getUserTestingJwt("test@example.com");
                String requestJson = """
                                {
                                "phoneNumber": "1234567890"
                                }
                                """;

                MockMultipartFile dataPart = new MockMultipartFile("data", "",
                                "application/json",
                                requestJson.getBytes(StandardCharsets.UTF_8));

                mockMvc.perform(multipart("/users/me")
                                .file(dataPart)
                                .with(request -> {
                                        request.setMethod("PATCH");
                                        return request;
                                }).header("Authorization", "Bearer " + jwt))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.type").value("about:blank"))
                                .andExpect(jsonPath("$.title").value("Bad Request"))
                                .andExpect(jsonPath("$.status").value(400))
                                .andExpect(jsonPath("$.detail").value(ValidationErrorMessage.NOT_BUSINESS_ACCOUNT))
                                .andExpect(jsonPath("$.instance").value("/users/me"))
                                .andDo(print());
        }

        @Test
        void testGivenUserAccount_WhenPatchMeWithAveragePrice_ThenShouldFailAndReturnError400BadRequest()
                        throws Exception {
                String jwt = testHelper.getUserTestingJwt("test@example.com");
                String requestJson = """
                                {
                                "averagePrice": "$$"
                                }
                                """;

                MockMultipartFile dataPart = new MockMultipartFile("data", "",
                                "application/json",
                                requestJson.getBytes(StandardCharsets.UTF_8));

                mockMvc.perform(multipart("/users/me")
                                .file(dataPart)
                                .with(request -> {
                                        request.setMethod("PATCH");
                                        return request;
                                }).header("Authorization", "Bearer " + jwt))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.type").value("about:blank"))
                                .andExpect(jsonPath("$.title").value("Bad Request"))
                                .andExpect(jsonPath("$.status").value(400))
                                .andExpect(jsonPath("$.detail").value(ValidationErrorMessage.NOT_BUSINESS_ACCOUNT))
                                .andExpect(jsonPath("$.instance").value("/users/me"))
                                .andDo(print());
        }

        @Test
        void testGivenUserAccount_WhenPatchMeWithLocation_ThenShouldFailAndReturnError400BadRequest()
                        throws Exception {
                String jwt = testHelper.getUserTestingJwt("test@example.com");
                String requestJson = """
                                {
                                "location": "New Location"
                                }
                                """;

                MockMultipartFile dataPart = new MockMultipartFile("data", "",
                                "application/json",
                                requestJson.getBytes(StandardCharsets.UTF_8));

                mockMvc.perform(multipart("/users/me")
                                .file(dataPart)
                                .with(request -> {
                                        request.setMethod("PATCH");
                                        return request;
                                }).header("Authorization", "Bearer " + jwt))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.type").value("about:blank"))
                                .andExpect(jsonPath("$.title").value("Bad Request"))
                                .andExpect(jsonPath("$.status").value(400))
                                .andExpect(jsonPath("$.detail").value(ValidationErrorMessage.NOT_BUSINESS_ACCOUNT))
                                .andExpect(jsonPath("$.instance").value("/users/me"))
                                .andDo(print());
        }

        // @Test
        // void
        // testGivenUserAccount_WhenPatchMeCommonFields_ThenShouldSuccessAndReturn200()
        // throws Exception {
        // String jwt = testHelper.getUserTestingJwt("test@example.com");
        // String requestJson = """
        // {
        // "name": "New Name",
        // "description": "New Description",
        // "location": "New Location",
        // "phoneNumber": "1234567890",
        // "publicEmail": "new@example.com"
        // }
        // """;

        // MockMultipartFile dataPart = new MockMultipartFile("data", "",
        // "application/json",
        // requestJson.getBytes(StandardCharsets.UTF_8));

        // mockMvc.perform(multipart("/users/me")
        // .file(dataPart)
        // .with(request -> {
        // request.setMethod("PATCH");
        // return request;
        // }).header("Authorization", "Bearer " + jwt))
        // .andExpect(status().isBadRequest())
        // .andExpect(jsonPath("$.type").value("about:blank"))
        // .andExpect(jsonPath("$.title").value("Bad Request"))
        // .andExpect(jsonPath("$.status").value(400))
        // .andExpect(jsonPath("$.detail").value(ValidationErrorMessage.NOT_BUSINESS_ACCOUNT))
        // .andExpect(jsonPath("$.instance").value("/users/me"))
        // .andDo(print());
        // }

        // @Test
        // void
        // testGivenUserAccount_WhenPatchMeWithRestaurantFields_ThenShouldFailAndReturnError400BadRequest()
        // throws Exception {
        // String jwt = testHelper.getUserTestingJwt("test@example.com");
        // String requestJson = """
        // {
        // "restaurantType": "Comida peruana"
        // }
        // """;

        // MockMultipartFile dataPart = new MockMultipartFile("data", "",
        // "application/json",
        // requestJson.getBytes(StandardCharsets.UTF_8));

        // mockMvc.perform(multipart("/users/me")
        // .file(dataPart)
        // .with(request -> {
        // request.setMethod("PATCH");
        // return request;
        // }).header("Authorization", "Bearer " + jwt))
        // .andExpect(status().isBadRequest())
        // .andExpect(jsonPath("$.type").value("about:blank"))
        // .andExpect(jsonPath("$.title").value("Bad Request"))
        // .andExpect(jsonPath("$.status").value(400))
        // .andExpect(jsonPath("$.detail").value(ValidationErrorMessage.NOT_BUSINESS_ACCOUNT))
        // .andExpect(jsonPath("$.instance").value("/users/me"))
        // .andDo(print());
        // }

        // @Test
        // void testGivenNoTitle_WhenCreatePublication_ThenShouldFailAndReturnError400()
        // throws Exception {
        // String jwt = testHelper.getUserTestingJwt("test@example.com");

        // String requestJson = """
        // {
        // "description": "Beautiful place with amazing views and full amenities.",
        // "phoneNumber": "+541112345678",
        // "email": "contact@hostel.com",
        // "location": "San Carlos de Bariloche, Argentina",
        // "openingDays": ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
        // "attentionSchedule": {
        // "openingTime": "09:00",
        // "closingTime": "18:00"
        // },
        // "exceptionalClosingDays": ["2025-12-25", "2025-01-01"],
        // "tags": ["hostel", "mountain", "nature"]
        // }
        // """;

        // MockMultipartFile dataPart = new MockMultipartFile("data", "",
        // "application/json",
        // requestJson.getBytes(StandardCharsets.UTF_8));

        // mockMvc.perform(multipart("/publications/business").file(dataPart).header("Authorization",
        // "Bearer " + jwt))
        // .andExpect(status().isBadRequest())
        // .andExpect(jsonPath("$.type").value("about:blank"))
        // .andExpect(jsonPath("$.title").value("Validation Error"))
        // .andExpect(jsonPath("$.status").value(400))
        // .andExpect(jsonPath("$.detail")
        // .value("title: " + ValidationErrorMessage.EMPTY_OR_NULL_FIELD))
        // .andExpect(jsonPath("$.instance").value("/publications/business"))
        // .andDo(print());
        // }

        // @Test
        // void
        // testGivenNoDescription_WhenCreatePublication_ThenShouldFailAndReturnError400()
        // throws Exception {
        // String jwt = testHelper.getUserTestingJwt("test@example.com");

        // String requestJson = """
        // {
        // "title": "Beautiful place with amazing views and full amenities.",
        // "phoneNumber": "+541112345678",
        // "email": "contact@hostel.com",
        // "location": "San Carlos de Bariloche, Argentina",
        // "openingDays": ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
        // "attentionSchedule": {
        // "openingTime": "09:00",
        // "closingTime": "18:00"
        // },
        // "exceptionalClosingDays": ["2025-12-25", "2025-01-01"],
        // "tags": ["hostel", "mountain", "nature"]
        // }
        // """;

        // MockMultipartFile dataPart = new MockMultipartFile("data", "",
        // "application/json",
        // requestJson.getBytes(StandardCharsets.UTF_8));

        // mockMvc.perform(multipart("/publications/business").file(dataPart).header("Authorization",
        // "Bearer " + jwt))
        // .andExpect(status().isBadRequest())
        // .andExpect(jsonPath("$.type").value("about:blank"))
        // .andExpect(jsonPath("$.title").value("Validation Error"))
        // .andExpect(jsonPath("$.status").value(400))
        // .andExpect(jsonPath("$.detail")
        // .value("description: " + ValidationErrorMessage.EMPTY_OR_NULL_FIELD))
        // .andExpect(jsonPath("$.instance").value("/publications/business"))
        // .andDo(print());
        // }

        // @Test
        // void
        // testGivenJustDescriptionAndTitle_WhenCreatePublication_ThenShouldSuccess()
        // throws Exception {
        // String jwt = testHelper.getUserTestingJwt("test@example.com");

        // String requestJson = """
        // {
        // "title": "Beautiful place with amazing views and full amenities.",
        // "description": "Beautiful place with amazing views and full amenities."
        // }
        // """;

        // MockMultipartFile dataPart = new MockMultipartFile("data", "",
        // "application/json",
        // requestJson.getBytes(StandardCharsets.UTF_8));
        // mockMvc.perform(multipart("/publications/business").file(dataPart).header("Authorization",
        // "Bearer " + jwt))
        // .andExpect(status().isOk())
        // .andExpect(jsonPath("$.id").isNotEmpty())
        // .andExpect(jsonPath("$.title")
        // .value("Beautiful place with amazing views and full amenities."))
        // .andExpect(jsonPath("$.description")
        // .value("Beautiful place with amazing views and full amenities."))
        // .andExpect(jsonPath("$.openingDays").isArray())
        // .andExpect(jsonPath("$.openingDays").isEmpty())
        // .andExpect(jsonPath("$.attentionSchedule").value(Matchers.nullValue()))
        // .andExpect(jsonPath("$.phoneNumber").value(Matchers.nullValue()))
        // .andExpect(jsonPath("$.email").value(Matchers.nullValue()))
        // .andExpect(jsonPath("$.location").value(Matchers.nullValue()))
        // .andExpect(jsonPath("$.imageUrls").isArray())
        // .andExpect(jsonPath("$.imageUrls").isEmpty())
        // .andExpect(jsonPath("$.tags").isArray())
        // .andExpect(jsonPath("$.tags").isEmpty())
        // .andExpect(jsonPath("$.ownerId").isNotEmpty())
        // .andExpect(jsonPath("$.ownerUsername").exists())
        // .andExpect(jsonPath("$.createdAt").isNotEmpty())
        // .andDo(print());
        // }

        // @Test
        // void testGivenAllFieldsExceptImages_WhenCreatePublication_ThenShouldSuccess()
        // throws Exception {
        // String jwt = testHelper.getUserTestingJwt("test@example.com");

        // String requestJson = """
        // {
        // "title": "Beautiful place with amazing views and full amenities.",
        // "description": "Beautiful place with amazing views and full amenities.",
        // "phoneNumber": "+541112345678",
        // "email": "contact@hostel.com",
        // "location": "San Carlos de Bariloche, Argentina",
        // "openingDays": ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
        // "attentionSchedule": {
        // "openingTime": "09:00",
        // "closingTime": "18:00"
        // },
        // "exceptionalClosingDays": ["2025-12-25", "2025-01-01"],
        // "tags": ["hostel", "mountain", "nature"]
        // }
        // """;

        // MockMultipartFile dataPart = new MockMultipartFile("data", "",
        // "application/json",
        // requestJson.getBytes(StandardCharsets.UTF_8));
        // mockMvc.perform(multipart("/publications/business").file(dataPart).header("Authorization",
        // "Bearer " + jwt))
        // .andExpect(status().isOk())
        // .andExpect(jsonPath("$.id").isNotEmpty())
        // .andExpect(jsonPath("$.title")
        // .value("Beautiful place with amazing views and full amenities."))
        // .andExpect(jsonPath("$.description")
        // .value("Beautiful place with amazing views and full amenities."))
        // .andExpect(jsonPath("$.openingDays").isArray())
        // .andExpect(jsonPath("$.openingDays",
        // contains("MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY")))
        // .andExpect(jsonPath("$.attentionSchedule.openingTime").value("09:00"))
        // .andExpect(jsonPath("$.attentionSchedule.closingTime").value("18:00"))
        // .andExpect(jsonPath("$.phoneNumber").value("+541112345678"))
        // .andExpect(jsonPath("$.email").value("contact@hostel.com"))
        // .andExpect(jsonPath("$.location").value("San Carlos de Bariloche,
        // Argentina"))
        // .andExpect(jsonPath("$.imageUrls").isArray())
        // .andExpect(jsonPath("$.imageUrls").isEmpty())
        // .andExpect(jsonPath("$.tags").isArray())
        // .andExpect(jsonPath("$.tags", contains("hostel", "mountain", "nature")))
        // .andExpect(jsonPath("$.ownerId").isNotEmpty())
        // .andExpect(jsonPath("$.ownerUsername").exists())
        // .andExpect(jsonPath("$.createdAt").isNotEmpty())
        // .andDo(print());
        // }

}