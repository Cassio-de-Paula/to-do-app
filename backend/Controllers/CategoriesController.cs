using backend.Data;
using backend.Helpers;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;

        public CategoriesController(AppDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        // GET: api/Categories/
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Category>>> GetAllByUser()
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var categories = await _context.Categories
                .Where(c => c.UserId == userId)
                .ToListAsync();

            return Ok(categories);
        }

        // GET: api/Categories/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Category>> GetById(Guid id)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var category = await _context.Categories
                .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

            if (category == null) return NotFound();
            return Ok(category);
        }

        // POST: api/Categories
        [HttpPost]
        public async Task<ActionResult<Category>> Create(Category category)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            // Vincula a categoria ao usuário
            category.UserId = userId.Value;

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = category.Id }, category);
        }

        // PUT: api/Categories/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, Category category)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            if (id != category.Id) return BadRequest();

            var existingCategory = await _context.Categories
                .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

            if (existingCategory == null) return NotFound();

            existingCategory.Name = category.Name;
            existingCategory.Color = category.Color;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/Categories/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var category = await _context.Categories
                .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

            if (category == null) return NotFound();

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // -------------------------
        // Helpers
        // -------------------------
        private Guid? GetUserId()
        {
            var jwt = Request.Cookies["access_token"];
            if (string.IsNullOrEmpty(jwt)) return null;

            return JwtHelper.GetUserIdFromToken(jwt, _config);
        }
    }
}
