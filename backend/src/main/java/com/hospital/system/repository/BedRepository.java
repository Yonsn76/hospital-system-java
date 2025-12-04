package com.hospital.system.repository;

import com.hospital.system.model.Bed;
import com.hospital.system.model.BedStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for Bed entity operations.
 * Requirements 7.5: Display real-time status of all beds by area
 */
@Repository
public interface BedRepository extends JpaRepository<Bed, Long> {

    List<Bed> findByStatus(BedStatus status);

    List<Bed> findByArea(String area);

    List<Bed> findByAreaAndStatus(String area, BedStatus status);

    Optional<Bed> findByBedNumber(String bedNumber);

    List<Bed> findAllByOrderByAreaAscBedNumberAsc();

    List<Bed> findByStatusOrderByAreaAscBedNumberAsc(BedStatus status);
}
