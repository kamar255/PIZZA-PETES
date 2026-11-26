
package com.pizzapetes.config;

import com.pizzapetes.security.JwtAuthFilter;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final CorsConfigurationSource corsConfigurationSource;

    public SecurityConfig(
            JwtAuthFilter jwtAuthFilter,
            CorsConfigurationSource corsConfigurationSource) {

        this.jwtAuthFilter = jwtAuthFilter;
        this.corsConfigurationSource = corsConfigurationSource;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration)
            throws Exception {

        return configuration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
                .cors(cors -> cors.configurationSource(
                        corsConfigurationSource
                ))

                .csrf(csrf -> csrf.disable())

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .authorizeHttpRequests(auth -> auth

                        // Authentification publique
                        .requestMatchers("/api/auth/**").permitAll()

                        // Consultation des pizzas publique
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/pizzas",
                                "/api/pizzas/**"
                        ).permitAll()

                        // Gestion des pizzas : administrateur
                        .requestMatchers("/api/pizzas/**")
                        .hasRole("ADMIN")

                        // Consultation du profil personnel
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/users/profile"
                        ).authenticated()

                        // Modification du profil personnel
                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/users/profile"
                        ).authenticated()

                        // Gestion des autres utilisateurs : administrateur
                        .requestMatchers("/api/users/**")
                        .hasRole("ADMIN")

                        // Consultation des commandes personnelles
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/orders/my-orders"
                        ).authenticated()

                        // Consultation générale des commandes : administrateur
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/orders",
                                "/api/orders/status/**",
                                "/api/orders/user/**",
                                "/api/orders/*"
                        ).hasRole("ADMIN")

                        // Modification du statut : administrateur
                        .requestMatchers(
                                HttpMethod.PATCH,
                                "/api/orders/*/status"
                        ).hasRole("ADMIN")

                        // Suppression des commandes : administrateur
                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/orders/**"
                        ).hasRole("ADMIN")

                        // Création d'une commande : utilisateur connecté
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/orders"
                        ).authenticated()

                        // Toutes les autres routes nécessitent une connexion
                        .anyRequest().authenticated()
                )

                .addFilterBefore(
                        jwtAuthFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }
}
