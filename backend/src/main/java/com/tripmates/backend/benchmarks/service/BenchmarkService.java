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
import com.tripmates.backend.common.exception.UnauthorizedException;
import com.tripmates.backend.common.types.Role;

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
		if (authUser.getRole() != Role.BUSINESS)
			throw new UnauthorizedException(ValidationErrorMessage.UNAUTHORIZED);
		return authUser.getId();
	}

	private String checkExistentBussinessAccountById(String userId) {
		Account authUser = accountRepository.findById(userId)
			.orElseThrow(() -> new NotFoundException(ValidationErrorMessage.USER_NOT_FOUND));
		if (authUser.getRole() != Role.BUSINESS)
			throw new UnauthorizedException(ValidationErrorMessage.UNAUTHORIZED);
		return authUser.getId();
	}

	public List<BenchmarkItemDTO> getMyBenchmarks(String authUserEmail) {
		String authUserId = checkExistentBussinessAccountByEmail(authUserEmail);
		List<BenchmarkItemDTO> progress = getBenchmarks(authUserId);
		return progress;
	}

	public List<BenchmarkItemDTO> getBenchmarks(String userId) {
		List<BenchmarkItemDTO> progress = benchmarkRepository.findByUserId(userId)
			.stream()
			.map(progressItem -> BenchmarkItemDTO.from(progressItem))
			.collect(Collectors.toList());

		return progress;
	}

	public List<BenchmarkItemDTO> updateBenchmarkVisibility(List<BenchmarkItemDTO> updates, String authUserEmail) {
		String authUserId = checkExistentBussinessAccountByEmail(authUserEmail);
		Boolean benchmarkNotFound = false;
		Boolean benchmarkCannotBeUpdated = false;

		for (BenchmarkItemDTO update : updates) {
			if (benchmarkRepository.findByUserIdAndBenchmarkId(authUserId, update.id()).isEmpty()) {
				benchmarkNotFound = true;
				continue;
			}
			if (benchmarkRepository.updateVisibility(authUserId, update.id(), update.visible()) == 0)
				benchmarkCannotBeUpdated = true;
		}

		if (benchmarkNotFound)
			throw new NotFoundException(ValidationErrorMessage.BENCHMARK_NOT_FOUND);
		if (benchmarkCannotBeUpdated)
			throw new NotFoundException(ValidationErrorMessage.BENCHMARK_CANNOT_BE_UPDATED);

		return updates;
	}

	public List<BenchmarkItemDTO> getPublicBenchmarks(String userId) {
		checkExistentBussinessAccountById(userId);
		List<BenchmarkItemDTO> progress = benchmarkRepository.findByUserId(userId)
			.stream()
			.map(progressItem -> BenchmarkItemDTO.from(progressItem))
			.filter(progressItem -> progressItem.visible())
			.collect(Collectors.toList());

		return progress;
	}

}
