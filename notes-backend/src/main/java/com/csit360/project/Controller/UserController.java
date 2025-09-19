package com.csit360.project.Controller;

import com.csit360.project.DTOs.UserDtos.UserData;
import com.csit360.project.Services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    private UserService userService;

        // GET
        @GetMapping
        public UserData getUser() {
            return null;
        }

        // POST
        @PostMapping
        public String createUser() {
            return "User created!";
        }

        // PUT
        @PutMapping
        public String updateUser() {
            return "User updated!";
        }

        // DELETE
        @DeleteMapping
        public String deleteUser() {
            return "User deleted!";
        }
}
