using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using Final_QuizApp.Models;
using Final_QuizApp.Data;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace Final_QuizApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class QuestionsController : ControllerBase
    {
        private readonly QuizDbContext _context;

        public QuestionsController(QuizDbContext context)
        {
            _context = context;
        }

        // POST: api/questions
        [HttpPost]
        public async Task<IActionResult> AddQuestion([FromBody] Question question)
        {
            if (question == null)
            {
                return BadRequest(new { message = "Invalid question data." });
            }

            // Add the question to the context
            _context.Questions.Add(question);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Question added successfully.", questionId = question.Id });
        }
        // GET: api/questions/category/{categoryName}
        [HttpGet("category/{categoryName}")]
        public IActionResult GetQuestionsByCategory(string categoryName)
        {
            // Deprecated: Category-based queries are not supported. Use eventId-based queries instead.
            return BadRequest(new { message = "Category-based queries are not supported. Use eventId-based queries instead." });
        }

        // GET: api/questions/random?category=xyz&count=10
        [HttpGet("random")]
        public async Task<IActionResult> GetRandomQuestions([FromQuery] string category, [FromQuery] int count = 10)
        {
            // Deprecated: Category-based queries are not supported. Use eventId-based queries instead.
            return BadRequest(new { message = "Category-based queries are not supported. Use eventId-based queries instead." });
        }
    }
}
