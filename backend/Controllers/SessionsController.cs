using backend.Data;
using backend.Helpers;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Net.Http;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

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
        // Endpoint de autenticação via Google
        // -------------------------
        [HttpPost("auth")]
        public async Task<IActionResult> GoogleAuth([FromBody] CredentialDto dto)
        {
            if (string.IsNullOrEmpty(dto.Credential))
                return BadRequest("Credential ausente");

            // 1️⃣ Validar JWT do Google
            var principal = await ValidateGoogleJwt(dto.Credential);
            if (principal == null) return Unauthorized("Credential inválida");

            var email = principal.FindFirstValue(ClaimTypes.Email);
            var name = principal.FindFirstValue("name");
            var profilePicture = principal.FindFirstValue("picture");

            if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(name))
                return BadRequest("Informações insuficientes na credential");

            // 2️⃣ Verificar se usuário já existe
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null)
            {
                user = new User
                {
                    Id = Guid.NewGuid(),
                    Email = email,
                    Username = name
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();
            }

            // 3️⃣ Gerar tokens JWT
            var accessToken = GenerateJwt(user, minutes: 15);
            var refreshToken = GenerateJwt(user, minutes: 60 * 24 * 7);

            // 4️⃣ Enviar refresh token como cookie HTTP-only
            Response.Cookies.Append("refresh_token", refreshToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = false,
                SameSite = SameSiteMode.Lax,
                Path = "/api/session"
            });

            Response.Cookies.Append("access_token", accessToken, new CookieOptions
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
                profile_picture = profilePicture
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

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            // Remove cookies do frontend
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
        // Helpers JWT
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
        // Validação segura do JWT do Google
        // -------------------------
        private async Task<ClaimsPrincipal?> ValidateGoogleJwt(string token)
        {
            var client = _httpClientFactory.CreateClient();
            var jwksResponse = await client.GetStringAsync("https://www.googleapis.com/oauth2/v3/certs");
            var keys = new JsonWebKeySet(jwksResponse);

            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = "https://accounts.google.com",
                ValidateAudience = true,
                ValidAudience = _config["Google:ClientId"],
                ValidateLifetime = true,
                IssuerSigningKeys = keys.Keys,
                ClockSkew = TimeSpan.Zero
            };

            var handler = new JwtSecurityTokenHandler();
            try
            {
                var principal = handler.ValidateToken(token, validationParameters, out var validatedToken);
                return principal;
            }
            catch
            {
                return null;
            }
        }
    }

    // DTO para receber credential do frontend
    public class CredentialDto
    {
        public string Credential { get; set; } = string.Empty;
    }
}
