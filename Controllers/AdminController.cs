using Final_QuizApp.Data;
using Final_QuizApp.DTO;
using Final_QuizApp.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Final_QuizApp.Controllers
{
    [ApiController]
    [Route("api/admin")]
    public class AdminController : ControllerBase
    {
        private readonly QuizDbContext _context;

        public AdminController(QuizDbContext context)
        {
            _context = context;
        }

        // ✅ Add Question
        [HttpPost("add-question")]
        public async Task<IActionResult> AddQuestion([FromBody] QuestionDTO question)
        {
            if (question == null || question.Options == null || !question.Options.Any())
                return BadRequest("Invalid question data");

            var q = new Question
            {
                Text = question.Text,
                QuizEventId = question.QuizEventId,
                CorrectOption = question.CorrectOption
            };

            _context.Questions.Add(q);
            await _context.SaveChangesAsync();

            foreach (var opt in question.Options)
            {
                _context.Options.Add(new Option
                {
                    QuestionId = q.Id,
                    OptionText = opt.Text,
                    OptionNumber = opt.Number
                });
            }

            await _context.SaveChangesAsync();
            return Ok("Question added");
        }

        // ✏️ Update Question
        [HttpPut("update-question/{id}")]
        public async Task<IActionResult> UpdateQuestion(int id, [FromBody] QuestionDTO question)
        {
            var existingQuestion = await _context.Questions
                .Include(q => q.Options)
                .FirstOrDefaultAsync(q => q.Id == id);

            if (existingQuestion == null)
                return NotFound($"No question found with ID: {id}");

            existingQuestion.Text = question.Text;
            existingQuestion.QuizEventId = question.QuizEventId;
            existingQuestion.CorrectOption = question.CorrectOption;

            _context.Options.RemoveRange(existingQuestion.Options);

            foreach (var opt in question.Options)
            {
                _context.Options.Add(new Option
                {
                    QuestionId = id,
                    OptionText = opt.Text,
                    OptionNumber = opt.Number
                });
            }

            await _context.SaveChangesAsync();
            return Ok("Question updated");
        }

        // 🗑️ Delete Question
        [HttpDelete("delete-question/{id}")]
        public async Task<IActionResult> DeleteQuestion(int id)
        {
            var question = await _context.Questions
                .Include(q => q.Options)
                .FirstOrDefaultAsync(q => q.Id == id);

            if (question == null)
                return NotFound($"No question found with ID: {id}");

            _context.Options.RemoveRange(question.Options);
            _context.Questions.Remove(question);

            await _context.SaveChangesAsync();
            return Ok("Question deleted");
        }

        // 📋 Get All Questions
        [HttpGet("all-questions")]
        public async Task<IActionResult> GetAllQuestions()
        {
            var questions = await _context.Questions
                .Select(q => new { q.Id, q.Text, q.QuizEventId })
                .ToListAsync();

            return Ok(questions);
        }
    }
}



