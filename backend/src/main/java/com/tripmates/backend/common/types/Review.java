package com.tripmates.backend.common.types;

import java.util.List;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Review {

    @Id
    private String reviewId=new ObjectId().toString();
    private String publicationId;
    private String title;
    private String content;
    private Double rating;
    private List<String> imageUrls;
    private String ownerId;

    public Review(
      String publicationId,
      String title, 
      String content, 
      Double rating, 
      List<String> imageUrls, 
      String ownerId
    ) {
        this.publicationId = publicationId;
        this.title = title;
        this.content = content;
        this.rating = rating;
        this.imageUrls = imageUrls;
        this.ownerId = ownerId;
    }
}
