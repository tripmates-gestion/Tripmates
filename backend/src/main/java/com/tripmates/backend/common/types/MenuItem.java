package com.tripmates.backend.common.types;

import java.util.List;

public record MenuItem(
                List<String> photosURLs,
                String foodName,
                Float price,
                String description) {
}
