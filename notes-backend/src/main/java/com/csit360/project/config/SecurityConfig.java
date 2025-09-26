package com.csit360.project.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Authorize all requests to be permitted
            .authorizeHttpRequests(authz -> authz
                .anyRequest().permitAll()
            )
            // Disable CSRF protection for this simple app
            .csrf(csrf -> csrf.disable())
            // Configure CORS with defaults
            .cors(withDefaults());

        return http.build();
    }
}