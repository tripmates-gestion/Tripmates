package com.tripmates.backend.benchmarks.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

import com.tripmates.backend.benchmarks.repository.BenchmarkRepository;
import com.tripmates.backend.common.constants.ValidationErrorMessage;
import com.tripmates.backend.common.exception.NotFoundException;
import com.tripmates.backend.users.repository.mongo.AccountRepository;
import com.tripmates.backend.benchmarks.dto.BenchmarkItemDTO;
import com.tripmates.backend.users.entity.mongo.Account;

@Component
@Transactional
@Service
public class BenchmarkService {

	@Autowired
	private BenchmarkRepository benchmarkRepository;

	@Autowired
	private AccountRepository accountRepository;

	private String checkExistentBussinessAccountByEmail(String authUserEmail) {
		Account authUser = accountRepository.findByEmail(authUserEmail)
			.orElseThrow(() -> new NotFoundException(ValidationErrorMessage.USER_NOT_FOUND));
		return authUser.getId();
	}

	/*
	 * private String checkExistentBussinessAccountById(String authUserId) { Account
	 * authUser = accountRepository.findById(authUserId) .orElseThrow(() -> new
	 * NotFoundException(ValidationErrorMessage.USER_NOT_FOUND)); return authUserId; }
	 */
	public List<BenchmarkItemDTO> getMyBenchmarks(String authUserEmail) {
		String authUserId = checkExistentBussinessAccountByEmail(authUserEmail);
		List<BenchmarkItemDTO> progress = getBenchMarks(authUserId);
		return progress;
	}

	/*
	 * public List<BenchmarkItemDTO> getPublicBenchmarks(String userId) { String
	 * authUserId = checkExistentBussinessAccountById(userId); List<BenchmarkItemDTO>
	 * progress = benchmarkRepository.findByUserId(userId) .stream() .filter(progressItem
	 * -> progressItem.getIsVisible()) .map(progressItem ->
	 * BenchmarkItemDTO.from(progressItem)) .collect(Collectors.toList());
	 *
	 * return progress; }
	 */
	public List<BenchmarkItemDTO> getBenchMarks(String userId) {
		List<BenchmarkItemDTO> progress = benchmarkRepository.findByUserId(userId)
			.stream()
			.map(progressItem -> BenchmarkItemDTO.from(progressItem))
			.collect(Collectors.toList());

		return progress;
	}

}
