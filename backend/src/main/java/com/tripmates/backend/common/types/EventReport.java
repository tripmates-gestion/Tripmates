package com.tripmates.backend.common.types;

import java.util.Date;
import java.util.List;

public record EventReport(Integer totalQuantity, List<Date> events) {
}
