package com.tripmates.backend.common.types;

public enum BenchmarkId {

	// Likes benchmarks
	firstLike(1, BenchmarkType.LIKES), tenLikes(10, BenchmarkType.LIKES), fiftyLikes(50, BenchmarkType.LIKES),
	hundredLikes(100, BenchmarkType.LIKES), thousandLikes(1000, BenchmarkType.LIKES),

	// Reviews benchmarks
	firstReview(1, BenchmarkType.REVIEWS), tenReviews(10, BenchmarkType.REVIEWS),
	fiftyReviews(50, BenchmarkType.REVIEWS), hundredReviews(100, BenchmarkType.REVIEWS);

	private final int threshold;

	private final BenchmarkType type;

	// Composite key for O(1) lookup: (type, threshold) -> BenchmarkId
	private static final java.util.Map<String, BenchmarkId> LOOKUP_MAP;

	static {
		LOOKUP_MAP = new java.util.HashMap<>();
		for (BenchmarkId benchmark : BenchmarkId.values()) {
			String key = makeKey(benchmark.type, benchmark.threshold);
			LOOKUP_MAP.put(key, benchmark);
		}
	}

	BenchmarkId(int threshold, BenchmarkType type) {
		this.threshold = threshold;
		this.type = type;
	}

	/**
	 * Gets the number required to achieve this benchmark.
	 * @return the threshold number
	 */
	public int getThreshold() {
		return threshold;
	}

	/**
	 * Gets the type of this benchmark.
	 * @return the benchmark type
	 */
	public BenchmarkType getType() {
		return type;
	}

	/**
	 * Finds a BenchmarkId by its type and threshold value in O(1) time.
	 * @param type the benchmark type
	 * @param threshold the threshold value
	 * @return the corresponding BenchmarkId, or null if no match is found
	 */
	public static BenchmarkId fromThresholdAndType(BenchmarkType type, int threshold) {
		return LOOKUP_MAP.get(makeKey(type, threshold));
	}

	/**
	 * Creates a composite key for the lookup map.
	 * @param type the benchmark type
	 * @param threshold the threshold value
	 * @return a unique string key
	 */
	private static String makeKey(BenchmarkType type, int threshold) {
		return type + ":" + threshold;
	}

	/**
	 * Enum representing different types of benchmarks.
	 */
	public enum BenchmarkType {

		LIKES, REVIEWS

	}

}
