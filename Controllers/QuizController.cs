using Final_QuizApp.Data;
using Final_QuizApp.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;

namespace Final_QuizApp.Controllers
{
    [ApiController]
    [Route("api/quiz")]
    public class QuizController : ControllerBase
    {
        private readonly QuizDbContext _context;

        public QuizController(QuizDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetQuestions([FromQuery] string category)
        {
            return BadRequest("Category-based queries are not supported. Use eventId-based queries instead.");
        }

        [HttpPost("submit-score")]
        public async Task<IActionResult> SubmitScore([FromBody] CandidateQuizResult submission)
        {
            // Save candidate quiz result to QuizResults table
            var result = new QuizResult
            {
                QuizId = submission.QuizId,
                Email = submission.Email,
                FullName = submission.FullName,
                Score = submission.Score,
                Feedback = submission.Feedback,
                Time = submission.Time ?? "-",
                Difficulty = submission.Difficulty ?? "-"
            };
            _context.QuizResults.Add(result);
            await _context.SaveChangesAsync();
            return Ok(new { success = true, score = result.Score, rightAnswers = submission.RightAnswers, wrongAnswers = submission.WrongAnswers });
        }

        [HttpGet("leaderboard")]
        public async Task<IActionResult> GetLeaderboard()
        {
            var topUsers = await _context.Users
                .OrderByDescending(u => u.Score)
                .Take(10)
                .Select(u => new
                {
                    u.FirstName,
                    u.LastName,
                    u.Username,
                    u.Score
                })
                .ToListAsync();

            return Ok(topUsers);
        }
    }

    public class CandidateQuizResult
    {
        public string QuizId { get; set; }
        public string Email { get; set; }
        public string FullName { get; set; }
        public int Score { get; set; }
        public string Feedback { get; set; }
        public string Time { get; set; }
        public string Difficulty { get; set; }
        public List<int> RightAnswers { get; set; }
        public List<int> WrongAnswers { get; set; }
    }
}

