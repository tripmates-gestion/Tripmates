package com.tripmates.backend.benchmarks.dto;

import java.util.List;

public record ChangeBenchmarkVisibilityRequestDTO(List<BenchmarkItemDTO> updates) {
}
