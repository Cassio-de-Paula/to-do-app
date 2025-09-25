using backend.Data;
using backend.Helpers;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json.Serialization;


namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SessionController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;
        private readonly IHttpClientFactory _httpClientFactory;

        public SessionController(AppDbContext context, IConfiguration config, IHttpClientFactory httpClientFactory)
        {
            _context = context;
            _config = config;
            _httpClientFactory = httpClientFactory;
        }

        // -------------------------
        // Endpoint de autenticação via Google (usando access token)
        // -------------------------
        [HttpPost("auth")]
        public async Task<IActionResult> GoogleAuth([FromBody] AccessTokenDto dto)
        {
            if (string.IsNullOrEmpty(dto.AccessToken))
                return BadRequest("Access token ausente");

            // 1️⃣ Buscar informações do usuário no Google
            var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", dto.AccessToken);

            var response = await client.GetAsync("https://www.googleapis.com/oauth2/v2/userinfo");
            if (!response.IsSuccessStatusCode)
                return Unauthorized("Access token inválido");

            var content = await response.Content.ReadAsStringAsync();

            var userInfo = System.Text.Json.JsonSerializer.Deserialize<GoogleUserInfo>(content);

            if (userInfo == null || string.IsNullOrEmpty(userInfo.Email) || string.IsNullOrEmpty(userInfo.Name))
                return BadRequest("Informações insuficientes no access token");

            // 2️⃣ Verificar se usuário já existe no banco
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == userInfo.Email);
            if (user == null)
            {
                user = new User
                {
                    Id = Guid.NewGuid(),
                    Email = userInfo.Email,
                    Username = userInfo.Name
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();
            }

            // 3️⃣ Gerar tokens JWT do seu sistema
            var accessTokenJwt = GenerateJwt(user, minutes: 15);
            var refreshToken = GenerateJwt(user, minutes: 60 * 24 * 7);

            // 4️⃣ Enviar refresh token e access token como cookies HTTP-only
            Response.Cookies.Append("refresh_token", refreshToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = false,
                SameSite = SameSiteMode.Lax,
                Path = "/api/session"
            });

            Response.Cookies.Append("access_token", accessTokenJwt, new CookieOptions
            {
                HttpOnly = true,
                Secure = false,
                SameSite = SameSiteMode.Lax,
                Path = "/"
            });

            return Ok(new
            {
                id = user.Id,
                username = user.Username,
                profile_picture = userInfo.Picture
            });
        }

        // -------------------------
        // Endpoint de refresh token
        // -------------------------
        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh()
        {
            var refreshToken = Request.Cookies["refresh_token"];
            if (string.IsNullOrEmpty(refreshToken))
                return Unauthorized("Refresh token ausente");

            var principal = JwtHelper.ValidateJwt(refreshToken, _config);
            if (principal == null) return Unauthorized("Refresh token inválido");

            var sub = principal.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(sub)) return Unauthorized();
            var userId = Guid.Parse(sub);

            var user = await _context.Users.FindAsync(userId);
            if (user == null) return Unauthorized();

            var newAccessToken = GenerateJwt(user, minutes: 15);

            Response.Cookies.Append("access_token", newAccessToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = false,
                SameSite = SameSiteMode.Lax,
                Path = "/"
            });

            return Ok(new { message = "Token refreshed" });
        }

        // -------------------------
        // Endpoint de logout
        // -------------------------
        [HttpPost("logout")]
        public IActionResult Logout()
        {
            if (Request.Cookies.ContainsKey("access_token"))
            {
                Response.Cookies.Delete("access_token", new CookieOptions
                {
                    HttpOnly = true,
                    Secure = false,
                    SameSite = SameSiteMode.Lax,
                    Path = "/"
                });
            }

            if (Request.Cookies.ContainsKey("refresh_token"))
            {
                Response.Cookies.Delete("refresh_token", new CookieOptions
                {
                    HttpOnly = true,
                    Secure = false,
                    SameSite = SameSiteMode.Lax,
                    Path = "/api/session"
                });
            }

            return Ok(new { message = "Logout realizado com sucesso" });
        }

        // -------------------------
        // Helper: gerar JWT interno
        // -------------------------
        private string GenerateJwt(User user, int minutes)
        {
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(JwtRegisteredClaimNames.UniqueName, user.Username)
            };

            var jwtKey = _config["Jwt:Key"] ?? throw new InvalidOperationException("A chave JWT não pode ser nula");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(minutes),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        // -------------------------
        // Classe auxiliar para desserializar JSON do Google
        // -------------------------
        private class GoogleUserInfo
        {
            [JsonPropertyName("id")]
            public string Id { get; set; } = string.Empty;

            [JsonPropertyName("email")]
            public string Email { get; set; } = string.Empty;

            [JsonPropertyName("name")]
            public string Name { get; set; } = string.Empty;

            [JsonPropertyName("picture")]
            public string Picture { get; set; } = string.Empty;
        }
    }

    // -------------------------
    // DTO para receber access token do frontend
    // -------------------------
    public class AccessTokenDto
    {
        public string AccessToken { get; set; } = string.Empty;
    }
}
