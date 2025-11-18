package com.saj.controlador.controllers;

import com.saj.controlador.dto.AuthRequestDTO;
import com.saj.controlador.dto.AuthResponseDTO;
import com.saj.controlador.services.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Value("${jwt.expiration}")
    private Long jwtExpiration;

    @PostMapping("/login")
    public ResponseEntity<?> createAuthenticationToken(@RequestBody AuthRequestDTO authRequest, HttpServletResponse response) {
        try {
            AuthResponseDTO authResponse = authService.authenticate(authRequest);
            String jwt = authService.generateJwt(authRequest.getUsername());

            // Criar cookie HTTP-only com o JWT
            Cookie jwtCookie = new Cookie("jwt", jwt);
            jwtCookie.setHttpOnly(true);
            jwtCookie.setSecure(false); // Mudar para true em produção com HTTPS
            jwtCookie.setPath("/");
            jwtCookie.setMaxAge((int) (jwtExpiration / 1000)); // Converter ms para segundos

            response.addCookie(jwtCookie);

            return ResponseEntity.ok(authResponse);
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Erro de autenticação: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro inesperado durante a autenticação: " + e.getMessage());
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        // Remover cookie JWT
        Cookie jwtCookie = new Cookie("jwt", null);
        jwtCookie.setHttpOnly(true);
        jwtCookie.setSecure(false); // Mudar para true em produção com HTTPS
        jwtCookie.setPath("/");
        jwtCookie.setMaxAge(0); // Expirar imediatamente

        response.addCookie(jwtCookie);

        return ResponseEntity.ok().body("Logout realizado com sucesso");
    }
}
