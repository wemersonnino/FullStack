# 🧱 Arquitetura do Backend — API Java Spring Boot + PostgreSQL

> **Projeto:** Plataforma Fundep (Estudo Full-Stack)
> **Tecnologias:** Spring Boot 3.x + Java 21 + PostgreSQL + Docker
> **Integrações:** NextAuth (Next.js), Strapi, .NET (módulos externos)

---

## ⚙️ 1. Objetivo

Construir uma **API REST segura e modular** para:
- autenticação via **OAuth2/JWT**,
- gerenciamento de usuários, roles e preferências,
- integração com o front-end Next.js (NextAuth),
- persistência em PostgreSQL,
- futura comunicação com Strapi e .NET.

---

## 🧩 2. Estrutura de Pastas Sugerida

`backend/`
`├─ src/`
`│ ├─ main/`
`│ │ ├─ java/br/ufmg/fundep/`
`│ │ │ ├─ FundepApplication.java`
`│ │ │ ├─ config/ ← segurança e CORS`
`│ │ │ ├─ controller/ ← endpoints REST`
`│ │ │ ├─ dto/ ← objetos de transporte`
`│ │ │ ├─ entity/ ← entidades JPA`
`│ │ │ ├─ repository/ ← interfaces JpaRepository`
`│ │ │ ├─ service/ ← regras de negócio`
`│ │ │ └─ security/ ← JWT, filtros e provider`
`│ │ └─ resources/`
`│ │ ├─ application.yml`
`│ │ └─ data.sql / schema.sql`
`│ └─ test/`
`│ └─ ...`
`└─ Dockerfile`

## 🐳 3. Docker Compose

```yaml
version: "3.9"
services:
  api-java:
    build: ./backend
    container_name: fundep-api-java
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=dev
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_NAME=fundep_db
      - DB_USER=fundep_user
      - DB_PASS=${ESCALA_DB_PASSWORD}
    depends_on:
      - postgres
    networks:
      - fundep_net

  postgres:
    image: postgres:15
    container_name: fundep-db
    environment:
      - POSTGRES_DB=fundep_db
      - POSTGRES_USER=fundep_user
      - POSTGRES_PASSWORD=${POSTGRES_ADMIN_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks:
      - fundep_net

volumes:
  pgdata:

networks:
  fundep_net:
    driver: bridge

```
## 🔐 4. Autenticação e Segurança

### 4.1 Fluxo

1. Front envia `POST /auth/exchange` com `{ email, password }`.
2. API valida usuário em PostgreSQL.
3. Gera `JWT` com roles e theme.
4. Retorna JSON para o NextAuth:
    `{`
  `"token": "jwt-token-gerado",`
  `"user": {`
    `"id": 1,`
    `"name": "Wemerson",`
    `"email": "wemerson@fundep.br",`
    `"roles": ["ADMIN", "USER"],`
    `"theme": "dark"`
  `}`
`}`
5. NextAuth armazena token e roles na sessão (session.user).
---
### 4.2 Configuração OAuth2 + JWT

**`SecurityConfig.java`**

`@Configuration`
`@EnableWebSecurity`
`@RequiredArgsConstructor`
`public class SecurityConfig {`
  `private final JwtAuthenticationFilter jwtFilter;`

  `@Bean`
  `public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {`
    `http`
      `.csrf(AbstractHttpConfigurer::disable)`
      `.authorizeHttpRequests(auth -> auth`
        `.requestMatchers("/auth/**", "/actuator/**").permitAll()`
        `.anyRequest().authenticated()`
      `)`
      `.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);`
    `return http.build();`
  `}`
`}`

**`JwtUtil.java`**

`@Component`
`public class JwtUtil {`
  `private final String secret = environment.getRequiredProperty("JWT_SECRET");`

  `public String generateToken(User user) {`
    `return Jwts.builder()`
      `.setSubject(user.getEmail())`
      `.claim("roles", user.getRoles())`
      `.claim("theme", user.getTheme())`
      `.setIssuedAt(new Date())`
      `.setExpiration(Date.from(Instant.now().plus(2, ChronoUnit.HOURS)))`
      `.signWith(SignatureAlgorithm.HS256, SECRET.getBytes())`
      `.compact();`
  `}`
`}`

---

## 🧠 5. Principais Endpoints

|Método|Rota|Descrição|
|---|---|---|
|`POST`|`/auth/exchange`|Login e geração de token JWT|
|`POST`|`/auth/register`|Criação de novo usuário|
|`GET`|`/users/me`|Retorna dados do usuário logado|
|`PATCH`|`/users/theme`|Atualiza preferência de tema|
|`GET`|`/noticias`|Retorna lista de notícias (mock inicial)|

---

### 5.1 Exemplo Controller `/auth/exchange`

`@RestController`
`@RequestMapping("/auth")`
`@RequiredArgsConstructor`
`public class AuthController {`
  `private final AuthService authService;`

  `@PostMapping("/exchange")`
  `public ResponseEntity<AuthResponse> authenticate(@RequestBody AuthRequest request) {`
    `return ResponseEntity.ok(authService.authenticate(request));`
  `}`
`}`


### 5.2 DTOs

`@Data`
`public class AuthRequest {`
  `private String email;`
  `private String password;`
`}`

`@Data`
`@Builder`
`public class AuthResponse {`
  `private String token;`
  `private UserDto user;`
`}`


---

## 🧱 6. Banco de Dados

### Entidade `User`

`@Entity`
`@Table(name = "users")`
`@Data`
`@NoArgsConstructor`
`@AllArgsConstructor`
`@Builder`
`public class User {`
  `@Id @GeneratedValue(strategy = GenerationType.IDENTITY)`
  `private Long id;`

  `@Column(unique = true)`
  `private String email;`

  `private String password;`
  `private String name;`
  `private String theme;`

  `@ElementCollection(fetch = FetchType.EAGER)`
  `@CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))`
  `@Column(name = "role")`
  `private Set<String> roles;`
`}`

### Conexão PostgreSQL (`application.yml`)

```
spring:
  datasource:
    url: jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}
    username: ${DB_USER}
    password: ${DB_PASS}
  jpa:
    hibernate:
      ddl-auto: update
    properties:
      hibernate:
        format_sql: true
    show-sql: true
server:
  port: 8080

```

---

## 🔗 7. Integração com o Frontend (NextAuth)

- **NextAuth Credentials Provider** chama `POST /auth/exchange`.
- Recebe token e roles → adiciona no `session.user`.
- Middleware (`middleware.ts`) usa o token para proteger rotas.
- Componente `<RequireRole>` filtra permissões no client.

---

## 🌍 8. Integrações Externas

|Sistema|Função|Endpoint base|
|---|---|---|
|**Strapi**|Conteúdo dinâmico (notícias, banners, blog)|`${NEXT_PUBLIC_STRAPI_API}`|
|**.NET API**|Dados de relatórios, gráficos e calendários (iCal + date-fns)|`${NEXT_PUBLIC_DOTNET_API}`|

O backend Java pode agir como **API Gateway**, redirecionando chamadas autenticadas para Strapi e .NET.

---

## 🧩 9. Boas Práticas

- Seguir princípios **SOLID** e **Clean Architecture**.
- Camadas bem separadas (`controller`, `service`, `repository`).
- DTOs entre API ↔ entidades JPA.
- Centralizar logs e erros em `GlobalExceptionHandler`.
- Versão do Java ≥ **21**.
- Testes com **JUnit 5** e **Mockito**.

---

## 🧾 10. Próximos Passos

-  Implementar `AuthService` completo com JWT e bcrypt.
-  Criar `UserController` com CRUD básico.
-  Mockar `/noticias` com dados estáticos para integração inicial.
-  Integrar com NextAuth e testar autenticação real.
-  Configurar volume persistente do PostgreSQL no Docker.

---

[^1]📘 **Autor:** Wemerson Pereira
📅 **Última atualização:** {{data_atual}}

[^1]: Autor Wemerson
