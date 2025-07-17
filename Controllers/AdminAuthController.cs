using Final_QuizApp.Data;
using Final_QuizApp.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Final_QuizApp.Controllers
{
    [ApiController]
    [Route("api/admin-auth")]
    public class AdminAuthController : ControllerBase
    {
        private readonly QuizDbContext _context;

        public AdminAuthController(QuizDbContext context)
        {
            _context = context;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] Admin login)
        {
            var admin = await _context.Admins.FirstOrDefaultAsync(a => a.Username == login.Username);
            if (admin == null || admin.PasswordHash != login.PasswordHash)
                return Unauthorized("Invalid admin credentials");

            return Ok(new { message = "Login successful", username = admin.Username });
        }


        [HttpGet("is-admin")]
        public async Task<IActionResult> IsAdmin([FromQuery] string username)
        {
            var admin = await _context.Admins.FirstOrDefaultAsync(a => a.Username == username);
            return Ok(admin != null);
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] Admin newAdmin)
        {
            var exists = await _context.Admins.AnyAsync(a => a.Username == newAdmin.Username);
            if (exists)
                return BadRequest("Username already exists");

            _context.Admins.Add(newAdmin);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Registration successful" });
        }
    }
}
