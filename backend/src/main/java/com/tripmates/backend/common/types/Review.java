package com.tripmates.backend.common.types;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Review {
    private String reviewId;
    private String publicationId;
    private String title;
    private String content;
    private Long rating;
    private List<String> imageUrls;
    private String ownerId;
}
