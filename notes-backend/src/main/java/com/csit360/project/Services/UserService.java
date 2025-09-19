package com.csit360.project.Services;

import com.csit360.project.DTOs.UserDtos.UserData;
import com.csit360.project.Entities.UserEntity;
import com.csit360.project.Repositories.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {
    private UserRepository userRepository;

    //post
    public UserEntity createUser(UserData userdata){
        UserEntity user = new UserEntity();
        user.setFirstname(userdata.getFirstName());
        user.setLastname(userdata.getLastName());
        user.setEmail(userdata.getEmail());
        user.setPassword(userdata.getPassword());

        return userRepository.save(user);
    }

    // UPDATE (PUT)
    public Optional<UserEntity> updateUser(int id, UserData userdata) {
        return userRepository.findById(id).map(existingUser -> {
            existingUser.setFirstname(userdata.getFirstName());
            existingUser.setLastname(userdata.getLastName());
            existingUser.setEmail(userdata.getEmail());
            return userRepository.save(existingUser);
        });
    }

    public UserEntity getUser(UserData userdata) {
        return userRepository.findAllByEmail(userdata.getEmail());
    }

    // DELETE
    public String deleteUser(UserData userdata) {
        UserEntity user = userRepository.findByEmail(userdata.getEmail());
        if (user != null) {
            userRepository.deleteById(user.getId());
            return "User deleted";
        }
        return "User not found";
    }
}
