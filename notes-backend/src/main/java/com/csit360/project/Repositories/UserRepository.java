package com.csit360.project.Repositories;

import com.csit360.project.Entities.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, Integer> {
    UserEntity findAllByEmail(String email);

    boolean existsByEmail(String email);

    UserEntity findByEmail(String email);
}
