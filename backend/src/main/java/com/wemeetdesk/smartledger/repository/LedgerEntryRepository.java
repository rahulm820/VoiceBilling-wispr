package com.wemeetdesk.smartledger.repository;

import com.wemeetdesk.smartledger.model.LedgerEntry;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface LedgerEntryRepository extends JpaRepository<LedgerEntry, String> {
    @EntityGraph(attributePaths = "items")
    List<LedgerEntry> findAllByUserIdOrderByEntryDateDesc(String userId);

    @EntityGraph(attributePaths = "items")
    @Query("SELECT l FROM LedgerEntry l WHERE l.userId = :userId AND (:type = '' OR l.type = :type) AND LOWER(l.partyName) LIKE LOWER(CONCAT('%', :search, '%')) AND l.entryDate >= :from AND l.entryDate <= :to ORDER BY l.entryDate DESC")
    List<LedgerEntry> search(@Param("userId") String userId, @Param("type") String type, @Param("search") String search, @Param("from") Instant from, @Param("to") Instant to);

    @EntityGraph(attributePaths = "items")
    Optional<LedgerEntry> findByIdAndUserId(String id, String userId);
}
