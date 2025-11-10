package com.tripmates.backend.users;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.test.context.ActiveProfiles;
import com.tripmates.backend.config.TestCloudinaryConfig;
import com.tripmates.backend.users.dto.FollowingsListResponseDTO;
import com.tripmates.backend.users.entity.mongo.Account;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import static org.junit.jupiter.api.Assertions.assertEquals;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.TestInstance;
import org.skyscreamer.jsonassert.JSONAssert;
import org.junit.jupiter.api.BeforeAll;
import com.tripmates.backend.TestHelper;
import com.tripmates.backend.common.types.BusinessType;
import com.tripmates.backend.common.types.Role;
import com.tripmates.backend.users.repository.mongo.AccountRepository;

import jakarta.validation.constraints.AssertFalse.List;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@AutoConfigureMockMvc
@Import({ TestCloudinaryConfig.class })
public class FollowUserTest {

	@LocalServerPort
	private int port;

	private TestHelper testHelper;

	@Autowired
	private TestRestTemplate restTemplate;

	@Autowired
	private MongoTemplate mongoTemplate;

	@Autowired
	private AccountRepository accountRepository;

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
  void testGivenNoJwt_WhenFollowUser_ThenShouldFailAndReturnError403() throws Exception {
    String userIdToFollow = "id-inexistente";
    ResponseEntity<String> response = restTemplate.postForEntity(testHelper.url("/users/" + userIdToFollow + "/follow"), null, String.class);
    assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
  }

  @Test
  void testGivenJwtOfUser_WhenFollowNoExistenteUser_ThenShouldFailAndReturnError404() throws Exception {
    String userIdToFollow = "id-inexistente";
    String jwt = testHelper.getUserTestingJwt("leti@example.com");
    HttpHeaders headers = new HttpHeaders();
    headers.setBearerAuth(jwt);
    HttpEntity<?> entity = new HttpEntity<>(headers);
    ResponseEntity<String> response = restTemplate.exchange(
        testHelper.url("/users/" + userIdToFollow + "/follow"),
        HttpMethod.POST,
        entity,
        String.class
    );
    assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    String expectedJson = "{" +
      "\"type\":\"about:blank\"," +
      "\"title\":\"Not Found Error\"," +
      "\"status\":404," +
      "\"detail\":\"El usuario no existe\"," +
      "\"instance\":\"/users/id-inexistente/follow\"" +
      "}";
    JSONAssert.assertEquals(expectedJson, response.getBody(),true);
  }
  
  @Test
  void testGivenTwoExistingUsers_WhenFollowUser_ThenShouldSucceed() throws Exception {
    Account leti = new Account();
		leti.setEmail("letia@gmail.com.ar");
		leti.setName("Leti");
		leti.setPassword("123456");
		leti.setRole(Role.USER);
    Account accountSaved = accountRepository.save(leti);


    String jwt = testHelper.getUserTestingJwt("other@example.com");
    HttpHeaders headers = new HttpHeaders();
    headers.setBearerAuth(jwt);
    HttpEntity<?> entity = new HttpEntity<>(headers);
    ResponseEntity<String> response = restTemplate.exchange(
        testHelper.url("/users/" + accountSaved.getId() + "/follow"),
        HttpMethod.POST,
        entity,
        String.class
    );

    assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
  }

  @Test
  void testGivenTwoExistingUsers_WhenFollowUser_ThenAppearInFollowersOnDb() throws Exception {
    Account followedAccount = new Account();
		followedAccount.setEmail("leti@gmail.com.ar");
		followedAccount.setName("Leti");
		followedAccount.setPassword("123456");
		followedAccount.setRole(Role.USER);
    Account followedAccountSaved = accountRepository.save(followedAccount);


    String jwt = testHelper.getUserTestingJwt("other@example.com");
    HttpHeaders headers = new HttpHeaders();
    headers.setBearerAuth(jwt);
    HttpEntity<?> entity = new HttpEntity<>(headers);
    restTemplate.exchange(
        testHelper.url("/users/" + followedAccountSaved.getId() + "/follow"),
        HttpMethod.POST,
        entity,
        String.class
    );

    Account followed = accountRepository.findById(followedAccountSaved.getId()).orElse(null);
    assertEquals(1, followed.getFollowers().size());

    Account follower = accountRepository.findByEmail("other@example.com").orElse(null);
    assertEquals(1, follower.getFollowings().size());
  }

  @Test
  void testGivenManyExistingUsers_WhenFollowOneUser_ThenAppearManyFollowersOnDb() throws Exception {
    Account followedAccount = new Account();
		followedAccount.setEmail("leti@gmail.com.ar");
		followedAccount.setName("Leti");
		followedAccount.setPassword("123456");
		followedAccount.setRole(Role.USER);
    Account followedAccountSaved = accountRepository.save(followedAccount);

    followUser("other@example.com", followedAccountSaved.getId());
    followUser("other2@example.com", followedAccountSaved.getId());
    followUser("other3@example.com", followedAccountSaved.getId());

    Account followed = accountRepository.findById(followedAccountSaved.getId()).orElse(null);
    assertEquals(3, followed.getFollowers().size());
  }

  @Test
  void testGivenManyExistingUsers_WhenFollowOneUser_ThenAppearOnFollowingsOnDb() throws Exception {
    Account followedAccount = new Account();
		followedAccount.setEmail("leti@gmail.com.ar");
		followedAccount.setName("Leti");
		followedAccount.setPassword("123456");
		followedAccount.setRole(Role.USER);
    Account followedAccountSaved = accountRepository.save(followedAccount);

    followUser("other@example.com", followedAccountSaved.getId());
    Account otherAccount = accountRepository.findByEmail("other@example.com").orElse(null);
    assertEquals(1, otherAccount.getFollowings().size());
    assertEquals(followedAccountSaved.getId(), otherAccount.getFollowings().get(0));    

    followUser("other2@example.com", followedAccountSaved.getId());
    Account other2Account = accountRepository.findByEmail("other2@example.com").orElse(null);
    assertEquals(1, other2Account.getFollowings().size());
    assertEquals(followedAccountSaved.getId(), other2Account.getFollowings().get(0));

    followUser("other3@example.com", followedAccountSaved.getId());
    Account other3Account = accountRepository.findByEmail("other3@example.com").orElse(null);
    assertEquals(1, other3Account.getFollowings().size());
    assertEquals(followedAccountSaved.getId(), other3Account.getFollowings().get(0));

    Account followed = accountRepository.findById(followedAccountSaved.getId()).orElse(null);
    assertEquals(3, followed.getFollowers().size());
  }


  @Test
  void testGivenUserAccount_WhenFollowBussinesAccount_ThenShouldFailAndReturnError400() throws Exception {
    Account bussinesAccount = new Account();
		bussinesAccount.setEmail("leti@gmail.com.ar");
		bussinesAccount.setName("Leti");
		bussinesAccount.setPassword("123456");
		bussinesAccount.setRole(Role.BUSINESS);
    Account bussinesAccountSaved = accountRepository.save(bussinesAccount);

    String jwt = testHelper.getUserTestingJwt("other@example.com");
    HttpHeaders headers = new HttpHeaders();
    headers.setBearerAuth(jwt);
    HttpEntity<?> entity = new HttpEntity<>(headers);
    ResponseEntity<String> response = restTemplate.exchange(
        testHelper.url("/users/" + bussinesAccountSaved.getId() + "/follow"),
        HttpMethod.POST,
        entity,
        String.class
    );
    assertEquals(400, response.getStatusCode().value());
    String expectedJson = "{" +
      "\"type\":\"about:blank\"," +
      "\"title\":\"Bad Request\"," +
      "\"status\":400," +
      "\"detail\":\"No puedes seguir/dejar de seguir a un cuenta de negocio\"," +
      "\"instance\":\"/users/" + bussinesAccountSaved.getId() + "/follow\"" +
      "}";
    JSONAssert.assertEquals(expectedJson, response.getBody(),true);
  }

  @Test
  void testGivenBusinessAccount_WhenFollowUserAccount_ThenShouldFailAndReturnError400() throws Exception {
    Account userAccount = new Account();
		userAccount.setEmail("leti@gmail.com.ar");
		userAccount.setName("Leti");
		userAccount.setPassword("123456");
		userAccount.setRole(Role.USER);
    Account userAccountSaved = accountRepository.save(userAccount);

    String jwt = testHelper.getBusinessTestingJwt("other@example.com", BusinessType.HOTEL);
    HttpHeaders headers = new HttpHeaders();
    headers.setBearerAuth(jwt);
    HttpEntity<?> entity = new HttpEntity<>(headers);
    ResponseEntity<String> response = restTemplate.exchange(
        testHelper.url("/users/" + userAccountSaved.getId() + "/follow"),
        HttpMethod.POST,
        entity,
        String.class
    );
    assertEquals(400, response.getStatusCode().value());
    String expectedJson = "{" +
      "\"type\":\"about:blank\"," +
      "\"title\":\"Bad Request\"," +
      "\"status\":400," +
      "\"detail\":\"No tienes permiso para realizar esta accion\"," +
      "\"instance\":\"/users/" + userAccountSaved.getId() + "/follow\"" +
      "}";
    JSONAssert.assertEquals(expectedJson, response.getBody(),true);
  }

  @Test
  void testGivenBusinessAccount_WhenFollowBusinessAccount_ThenShouldFailAndReturnError400() throws Exception {
    Account businessAccount = new Account();
		businessAccount.setEmail("leti@gmail.com.ar");
		businessAccount.setName("Leti");
		businessAccount.setPassword("123456");
		businessAccount.setRole(Role.BUSINESS);
    Account businessAccountSaved = accountRepository.save(businessAccount);

    String jwt = testHelper.getBusinessTestingJwt("other@example.com", BusinessType.HOTEL);
    HttpHeaders headers = new HttpHeaders();
    headers.setBearerAuth(jwt);
    HttpEntity<?> entity = new HttpEntity<>(headers);
    ResponseEntity<String> response = restTemplate.exchange(
        testHelper.url("/users/" + businessAccountSaved.getId() + "/follow"),
        HttpMethod.POST,
        entity,
        String.class
    );
    assertEquals(400, response.getStatusCode().value());
    String expectedJson = "{" +
      "\"type\":\"about:blank\"," +
      "\"title\":\"Bad Request\"," +
      "\"status\":400," +
      "\"detail\":\"No tienes permiso para realizar esta accion\"," +
      "\"instance\":\"/users/" + businessAccountSaved.getId() + "/follow\"" +
      "}";
    JSONAssert.assertEquals(expectedJson, response.getBody(),true);
  }

  @Test
  void testGivenUserAccount_WhenFollowItSelf_ThenShouldFailAndReturnError400() throws Exception {
    String jwt = testHelper.getUserTestingJwt("other@example.com");
    Account me = accountRepository.findByEmail("other@example.com").orElse(null);
    HttpHeaders headers = new HttpHeaders();
    headers.setBearerAuth(jwt);
    HttpEntity<?> entity = new HttpEntity<>(headers);
    ResponseEntity<String> response = restTemplate.exchange(
        testHelper.url("/users/" + me.getId() + "/follow"),
        HttpMethod.POST,
        entity,
        String.class
    );
    assertEquals(400, response.getStatusCode().value());
    String expectedJson = "{" +
      "\"type\":\"about:blank\"," +
      "\"title\":\"Bad Request\"," +
      "\"status\":400," +
      "\"detail\":\"No puedes dejar de seguirte/seguirte a ti mismo\"," +
      "\"instance\":\"/users/" + me.getId() + "/follow\"" +
      "}";
    JSONAssert.assertEquals(expectedJson, response.getBody(),true);
  }

  @Test
  void testGivenUserAccount_WhenUnfollowItSelf_ThenShouldFailAndReturnError400() throws Exception {
    String jwt = testHelper.getUserTestingJwt("other@example.com");
    Account me = accountRepository.findByEmail("other@example.com").orElse(null);
    HttpHeaders headers = new HttpHeaders();
    headers.setBearerAuth(jwt);
    HttpEntity<?> entity = new HttpEntity<>(headers);
    ResponseEntity<String> response = restTemplate.exchange(
        testHelper.url("/users/" + me.getId() + "/unfollow"),
        HttpMethod.POST,
        entity,
        String.class
    );
    assertEquals(400, response.getStatusCode().value());
    String expectedJson = "{" +
      "\"type\":\"about:blank\"," +
      "\"title\":\"Bad Request\"," +
      "\"status\":400," +
      "\"detail\":\"No puedes dejar de seguirte/seguirte a ti mismo\"," +
      "\"instance\":\"/users/" + me.getId() + "/unfollow\"" +
      "}";
    JSONAssert.assertEquals(expectedJson, response.getBody(),true);
  }

  @Test
  void testGivenUserAccount_WhenUnfollowAnotherUserNotFollowed_ThenShouldFailAndReturnError400() throws Exception {
    String jwt = testHelper.getUserTestingJwt("other@example.com");
    Account userAccount = new Account();
		userAccount.setEmail("leti@gmail.com.ar");
		userAccount.setName("Leti");
		userAccount.setPassword("123456");
		userAccount.setRole(Role.USER);
    Account userAccountSaved = accountRepository.save(userAccount);

    HttpHeaders headers = new HttpHeaders();
    headers.setBearerAuth(jwt);
    HttpEntity<?> entity = new HttpEntity<>(headers);
    ResponseEntity<String> response = restTemplate.exchange(
        testHelper.url("/users/" + userAccountSaved.getId() + "/unfollow"),
        HttpMethod.POST,
        entity,
        String.class
    );
    assertEquals(400, response.getStatusCode().value());
    String expectedJson = "{" +
      "\"type\":\"about:blank\"," +
      "\"title\":\"Bad Request\"," +
      "\"status\":400," +
      "\"detail\":\"No puedes dejar de seguir a alguien que no sigues\"," +
      "\"instance\":\"/users/" + userAccountSaved.getId() + "/unfollow\"" +
      "}";
    JSONAssert.assertEquals(expectedJson, response.getBody(),true);
  }

  
  @Test
  void testGivenUserAccount_WhenUnfollowAnotherUserFollowed_ThenShouldSuccessAndReturn204() throws Exception {
    String jwt = testHelper.getUserTestingJwt("other@example.com");
    Account userAccount = new Account();
		userAccount.setEmail("leti@gmail.com.ar");
		userAccount.setName("Leti");
		userAccount.setPassword("123456");
		userAccount.setRole(Role.USER);
    Account userAccountSaved = accountRepository.save(userAccount);

    HttpHeaders headers = new HttpHeaders();
    headers.setBearerAuth(jwt);
    HttpEntity<?> entity = new HttpEntity<>(headers);

    ResponseEntity<String> responseFollow = restTemplate.exchange(
        testHelper.url("/users/" + userAccountSaved.getId() + "/follow"),
        HttpMethod.POST,
        entity,
        String.class
    );
    assertEquals(204, responseFollow.getStatusCode().value());
    
    ResponseEntity<String> responseUnfollow = restTemplate.exchange(
        testHelper.url("/users/" + userAccountSaved.getId() + "/unfollow"),
        HttpMethod.POST,
        entity,
        String.class
    );
    assertEquals(204, responseUnfollow.getStatusCode().value());
  }

  @Test
  void testGivenNewUserAccount_WhenGetFollowings_ThenShouldSuccessAndReturn200WithFollowings() throws Exception {
    String jwt = testHelper.getUserTestingJwt("other@example.com");
    HttpHeaders headers = new HttpHeaders();
    headers.setBearerAuth(jwt);
    HttpEntity<?> entity = new HttpEntity<>(headers);
    ResponseEntity<String> response = restTemplate.exchange(
        testHelper.url("/users/me/followings"),
        HttpMethod.GET,
        entity,
        String.class
    );
    String expectedJson = "{" +
      "\"followings\":[]" +
      "}";
    assertEquals(200, response.getStatusCode().value());
    JSONAssert.assertEquals(expectedJson, response.getBody(),true);
  }

  @Test
  void testGivenNewUserAccount_WhenGetFollowers_ThenShouldSuccessAndReturn200WithFollowers() throws Exception {
    String jwt = testHelper.getUserTestingJwt("other@example.com");
    HttpHeaders headers = new HttpHeaders();
    headers.setBearerAuth(jwt);
    HttpEntity<?> entity = new HttpEntity<>(headers);
    ResponseEntity<String> response = restTemplate.exchange(
        testHelper.url("/users/me/followers"),
        HttpMethod.GET,
        entity,
        String.class
    );
    String expectedJson = "{" +
      "\"followers\":[]" +
      "}";
    assertEquals(200, response.getStatusCode().value());
    JSONAssert.assertEquals(expectedJson, response.getBody(),true);
  }

  @Test
  void testGivenMeFollowingAUserAccount_WhenGetFollowers_ThenShouldSuccessAndReturn200WithFollowers() throws Exception {
    String jwt = testHelper.getUserTestingJwt("me@example.com");
    HttpHeaders headers = new HttpHeaders();
    headers.setBearerAuth(jwt);
    HttpEntity<?> entity = new HttpEntity<>(headers);

    Account other = new Account();
    other.setEmail("other@example.com");
    other.setName("Other");
    other.setPassword("123456");
    other.setRole(Role.USER);
    Account otherSaved = accountRepository.save(other);
    followUserWithPreviusJwt(jwt, otherSaved.getId());

    ResponseEntity<String> response = restTemplate.exchange(
        testHelper.url("/users/me/followings"),
        HttpMethod.GET,
        entity,
        String.class
    );
    String expectedJson = "{" +
      "\"followings\":[{" +
        "\"name\":\"Other\"," +
        "\"email\":\"other@example.com\"," +
        "\"role\":\"USER\"" +
      "}]" +
    "}";
    assertEquals(200, response.getStatusCode().value());
    JSONAssert.assertEquals(expectedJson, response.getBody(),false);
  }

    void followUserWithPreviusJwt(String jwt, String followedUserId) {
    HttpHeaders headers = new HttpHeaders();
    headers.setBearerAuth(jwt);
    HttpEntity<?> entity = new HttpEntity<>(headers);
    restTemplate.exchange(
        testHelper.url("/users/" + followedUserId + "/follow"),
        HttpMethod.POST,
        entity,
        String.class
    );
  }

  private void followUser(String followerEmail, String followedUserId) {
    String jwt = testHelper.getUserTestingJwt(followerEmail);
    HttpHeaders headers = new HttpHeaders();
    headers.setBearerAuth(jwt);
    HttpEntity<?> entity = new HttpEntity<>(headers);
    restTemplate.exchange(
        testHelper.url("/users/" + followedUserId + "/follow"),
        HttpMethod.POST,
        entity,
        String.class
    );
  }




}