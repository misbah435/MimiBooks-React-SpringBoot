package MimiBooks.controller;

import MimiBooks.model.User;
import MimiBooks.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (user.getName() == null || user.getName().isBlank()
                || user.getEmail() == null || user.getEmail().isBlank()
                || user.getPassword() == null || user.getPassword().length() < 6) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Enter name, email and password (minimum 6 characters)."));
        }

        String email = user.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Email is already registered."));
        }

        user.setEmail(email);
        user.setPassword(encoder.encode(user.getPassword()));
        User saved = userRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "message", "Registration successful!",
                "id", saved.getId(),
                "name", saved.getName(),
                "email", saved.getEmail()
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String email = request.getOrDefault("email", "").trim().toLowerCase();
        String password = request.getOrDefault("password", "");

        return userRepository.findByEmail(email)
                .filter(user -> encoder.matches(password, user.getPassword()))
                .<ResponseEntity<?>>map(user -> ResponseEntity.ok(Map.of(
                        "message", "Login successful!",
                        "id", user.getId(),
                        "name", user.getName(),
                        "email", user.getEmail()
                )))
                .orElseGet(() -> ResponseEntity.status(401)
                        .body(Map.of("message", "Invalid email or password.")));
    }
}
