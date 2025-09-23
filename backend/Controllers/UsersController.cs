using backend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using backend.Helpers;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;

        public UsersController(AppDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        // GET: api/Users/Data
        [HttpGet("data")]
        public async Task<IActionResult> Get()
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound();

            return Ok(new
            {
                id = user.Id,
                username = user.Username
            });
        }

        // DELETE: api/Users/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            // Usuário só pode deletar sua própria conta
            if (userId != id) return Unauthorized("Você só pode deletar sua própria conta.");

            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // -------------------------
        // Helper para extrair UserId do JWT do cookie
        // -------------------------
        private Guid? GetUserId()
        {
            var jwt = Request.Cookies["access_token"];
            if (string.IsNullOrEmpty(jwt)) return null;

            return JwtHelper.GetUserIdFromToken(jwt, _config);
        }
    }
}
