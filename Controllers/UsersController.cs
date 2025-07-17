using Final_QuizApp.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Final_QuizApp.Controllers
{
    [ApiController]
    [Route("api/users")]
    public class UsersController : ControllerBase
    {
        private readonly QuizDbContext _context;

        public UsersController(QuizDbContext context)
        {
            _context = context;
        }

        // ✅ Check if user is an admin
        [HttpGet("is-admin")]
        public async Task<IActionResult> IsAdmin([FromQuery] string username)
        {
            if (string.IsNullOrEmpty(username))
                return BadRequest("Username is required.");

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Username == username);

            if (user == null)
                return NotFound("User not found.");

            return Ok(user.IsAdmin);
        }
    }
}


