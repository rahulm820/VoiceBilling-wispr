package com.wemeetdesk.smartledger.repository;

import com.wemeetdesk.smartledger.model.Settings;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface SettingsRepository extends JpaRepository<Settings, String> {
    Optional<Settings> findByUserId(String userId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM Settings s WHERE s.userId = :userId")
    Optional<Settings> findByUserIdForUpdate(@Param("userId") String userId);

    @Modifying
    @Query("UPDATE Settings s SET s.nextBillNumber = s.nextBillNumber + 1 WHERE s.userId = :userId")
    int incrementBillNumber(@Param("userId") String userId);
}
