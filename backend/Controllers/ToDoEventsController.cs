using backend.Data;
using backend.Helpers;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ToDoEventsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;

        public ToDoEventsController(AppDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        // GET: api/ToDoEvents
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ToDoEvent>>> GetAll()
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var todos = await _context.ToDoEvents
                .Include(t => t.Category)
                .Where(t => t.UserId == userId)
                .ToListAsync();

            return Ok(todos);
        }

        // GET: api/ToDoEvents/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ToDoEvent>> GetById(Guid id)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var todo = await _context.ToDoEvents
                .Include(t => t.Category)
                .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

            if (todo == null) return NotFound();
            return Ok(todo);
        }

        // POST: api/ToDoEvents
        [HttpPost]
        public async Task<ActionResult<ToDoEvent>> Create([FromBody] ToDoEvent todo)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            // Vincula o evento ao usuário logado
            todo.UserId = userId.Value;

            _context.ToDoEvents.Add(todo);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = todo.Id }, todo);
        }

        // PUT: api/ToDoEvents/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] ToDoEvent todo)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            if (id != todo.Id) return BadRequest();

            var existingTodo = await _context.ToDoEvents
                .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

            if (existingTodo == null) return NotFound();

            existingTodo.Title = todo.Title;
            existingTodo.Description = todo.Description;
            existingTodo.Deadline = todo.Deadline;
            existingTodo.IsDone = todo.IsDone;
            existingTodo.CategoryId = todo.CategoryId;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/ToDoEvents/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var todo = await _context.ToDoEvents
                .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

            if (todo == null) return NotFound();

            _context.ToDoEvents.Remove(todo);
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
