using Microsoft.AspNetCore.Mvc;
using Final_QuizApp.Data;
using Final_QuizApp.Models;
using Final_QuizApp.DTO;
using System;

namespace Final_QuizApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ActivityLogController : ControllerBase
    {
        private readonly QuizDbContext _context;
        public ActivityLogController(QuizDbContext context)
        {
            _context = context;
        }

        [HttpPost("log")]
        public IActionResult LogActivity([FromBody] QuizActivityLogDTO dto)
        {
            var log = new QuizActivityLog
            {
                QuizId = dto.QuizId,
                UserEmail = dto.UserEmail,
                UserName = dto.UserName,
                ActionType = dto.ActionType,
                Details = dto.Details,
                Timestamp = DateTime.UtcNow
            };
            _context.QuizActivityLogs.Add(log);
            _context.SaveChanges();
            return Ok();
        }
    }
}
