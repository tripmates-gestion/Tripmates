package com.tripmates.backend.publications.repository.neo4j;

import com.tripmates.backend.publications.entity.neo4j.PublicationNode;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PublicationNodeRepository extends Neo4jRepository<PublicationNode, String> {

    @Query("""
        MATCH (a:AccountNode {id: $accountId})
        OPTIONAL MATCH (a)-[:FOLLOWS*1..2]->(f:AccountNode)
        WITH a, COLLECT(DISTINCT f) + a AS allRelevantAccounts
        UNWIND allRelevantAccounts AS account
        
        MATCH (account)-[interaction:REVIEWED|LIKED]->(pub:PublicationNode)
        WHERE (interaction:REVIEWED AND interaction.rating >= 3) OR interaction:LIKED
        
        MATCH (business:AccountNode)-[:CREATED]->(pub)
        MATCH (business)-[:CREATED]->(businessPub:PublicationNode)
        
        WHERE NOT (a)-[:REVIEWED|LIKED]->(businessPub)
        
        RETURN DISTINCT businessPub
        ORDER BY rand()
        SKIP $skip
        LIMIT $limit
    """)
    List<PublicationNode> findRecommendedPublications(@Param("accountId") String accountId, 
                                                    @Param("skip") int skip,
                                                    @Param("limit") int limit);

    @Query("""
        MATCH (a:AccountNode {id: $accountId})
        OPTIONAL MATCH (a)-[:FOLLOWS*1..2]->(f:AccountNode)
        WITH a, COLLECT(DISTINCT f) + a AS allRelevantAccounts
        UNWIND allRelevantAccounts AS account
        
        MATCH (account)-[interaction:REVIEWED|LIKED]->(pub:PublicationNode)
        WHERE (interaction:REVIEWED AND interaction.rating >= 3) OR interaction:LIKED
        
        MATCH (business:AccountNode)-[:CREATED]->(pub)
        MATCH (business)-[:CREATED]->(businessPub:PublicationNode)
        
        WHERE NOT (a)-[:REVIEWED|LIKED]->(businessPub)
        
        RETURN COUNT(DISTINCT businessPub)
    """)
    long countRecommendedPublications(@Param("accountId") String accountId);

    @Query("MATCH (p:PublicationNode {id: $id}) DETACH DELETE p")
    void deletePublicationNodeById(@Param("id") String id);
}