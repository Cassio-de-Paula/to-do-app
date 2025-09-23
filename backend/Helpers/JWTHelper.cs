using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace backend.Helpers
{
    public static class JwtHelper
    {
        // Já existente: valida JWT e retorna ClaimsPrincipal
        public static ClaimsPrincipal? ValidateJwt(string token, IConfiguration config)
        {
            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var jwtKey = config["Jwt:Key"] ?? throw new InvalidOperationException("A chave JWT não pode ser nula");
                var key = Encoding.UTF8.GetBytes(jwtKey);

                var parameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = config["Jwt:Issuer"],
                    ValidAudience = config["Jwt:Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ClockSkew = TimeSpan.Zero
                };

                var principal = tokenHandler.ValidateToken(token, parameters, out var validatedToken);
                return principal;
            }
            catch
            {
                return null;
            }
        }

        // Novo método: extrai UserId diretamente do token
        public static Guid? GetUserIdFromToken(string token, IConfiguration config)
        {
            var principal = ValidateJwt(token, config);
            if (principal == null) return null;

            var sub = principal.FindFirstValue(ClaimTypes.NameIdentifier);
            return string.IsNullOrEmpty(sub) ? null : Guid.Parse(sub);
        }
    }
}
