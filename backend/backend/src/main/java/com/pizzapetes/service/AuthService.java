
package com.pizzapetes.service;

import com.pizzapetes.dto.AuthResponse;
import com.pizzapetes.dto.LoginRequest;
import com.pizzapetes.dto.RegisterRequest;
import com.pizzapetes.dto.UserDTO;
import com.pizzapetes.entity.Role;
import com.pizzapetes.entity.User;
import com.pizzapetes.enums.RoleName;
import com.pizzapetes.repository.RoleRepository;
import com.pizzapetes.repository.UserRepository;
import com.pizzapetes.security.JwtService;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService) {

        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Cet email existe déjà !");
        }

        Role clientRole = roleRepository.findByName(RoleName.CLIENT)
                .orElseThrow(() ->
                        new RuntimeException("Le rôle CLIENT n'existe pas !"));

        User user = new User();

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(clientRole);

        userRepository.save(user);

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        String token = jwtService.generateToken(request.getEmail());

        UserDTO userDTO = convertToDTO(user);

        return new AuthResponse(
                token,
                "Inscription réussie !",
                userDTO
        );
    }

    public AuthResponse login(LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new RuntimeException("Utilisateur introuvable !"));

        String token = jwtService.generateToken(request.getEmail());

        UserDTO userDTO = convertToDTO(user);

        return new AuthResponse(
                token,
                "Connexion réussie !",
                userDTO
        );
    }

    private UserDTO convertToDTO(User user) {

        String roleName = user.getRole() != null
                ? user.getRole().getName().name()
                : "CLIENT";

        return new UserDTO(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getPhone(),
                roleName
        );
    }
}
