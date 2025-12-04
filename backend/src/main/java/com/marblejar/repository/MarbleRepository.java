package com.marblejar.repository;

import com.marblejar.entity.Marble;
import com.marblejar.entity.User;
import com.marblejar.entity.MarbleType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MarbleRepository extends JpaRepository<Marble, Long> {
    List<Marble> findByUser(User user);

    // Use User here (not userId) to match service impl that loads the User first
    long countByUserAndType(User user, MarbleType type);
}
