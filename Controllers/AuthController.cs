//using Final_QuizApp.Data;
//using Final_QuizApp.Models;
//using Microsoft.AspNetCore.Mvc;
//using Microsoft.EntityFrameworkCore;
//using Microsoft.IdentityModel.Tokens;
//using System.IdentityModel.Tokens.Jwt;
//using System.Security.Claims;
//using System.Text;

//namespace Final_QuizApp.Controllers
//{
//    [ApiController]
//    [Route("api/auth")]
//    public class AuthController : ControllerBase
//    {
//        private readonly QuizDbContext _context;
//        private readonly IConfiguration _config;

//        public AuthController(QuizDbContext context, IConfiguration config)
//        {
//            _context = context;
//            _config = config;
//        }

//        [HttpPost("register")]
//        public async Task<IActionResult> Register([FromBody] User user)
//        {
//            if (await _context.Users.AnyAsync(u => u.Username == user.Username))
//                return BadRequest("Username already exists");

//            _context.Users.Add(user);
//            await _context.SaveChangesAsync();
//            return Ok("User registered successfully");
//        }

//        [HttpPost("login")]
//        public async Task<IActionResult> Login([FromBody] User login)
//        {
//            var user = await _context.Users
//                .FirstOrDefaultAsync(u => u.Username == login.Username && u.Password == login.Password);

//            if (user == null)
//                return Unauthorized("Invalid credentials");

//            var claims = new[]
//            {
//                new Claim(ClaimTypes.Name, user.Username)
//            };

//            var key = Encoding.UTF8.GetBytes(_config["Jwt:Key"] ?? throw new InvalidOperationException("JWT key is missing"));
//            var creds = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256);

//            var token = new JwtSecurityToken(
//                issuer: _config["Jwt:Issuer"],
//                audience: _config["Jwt:Issuer"],
//                claims: claims,
//                expires: DateTime.Now.AddHours(1),
//                signingCredentials: creds
//            );

//            return Ok(new { token = new JwtSecurityTokenHandler().WriteToken(token) });
//        }
//    }
//}


using Final_QuizApp.Data;
using Final_QuizApp.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Final_QuizApp.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly QuizDbContext _context;
        private readonly IConfiguration _config;

        public AuthController(QuizDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        // ✅ Register endpoint (unchanged)
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] User user)
        {
            if (await _context.Users.AnyAsync(u => u.Username == user.Username))
                return BadRequest("Username already exists");

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return Ok("User registered successfully");
        }

        // ✅ Login endpoint using LoginRequest DTO
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest login)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Username == login.Username && u.Password == login.Password);

            if (user == null)
                return Unauthorized("Invalid credentials");

            var claims = new[]
            {
                new Claim(ClaimTypes.Name, user.Username),
                new Claim("IsAdmin", user.IsAdmin.ToString())
            };

            var key = Encoding.UTF8.GetBytes(_config["Jwt:Key"] ?? throw new InvalidOperationException("JWT key is missing"));
            var creds = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Issuer"],
                claims: claims,
                expires: DateTime.Now.AddHours(1),
                signingCredentials: creds
            );

            return Ok(new { token = new JwtSecurityTokenHandler().WriteToken(token) });
        }
    }
}








