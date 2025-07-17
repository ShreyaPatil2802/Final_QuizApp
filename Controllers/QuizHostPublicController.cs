using Microsoft.AspNetCore.Mvc;
using Final_QuizApp.Data;
using Final_QuizApp.Models;
using System.Linq;
using System.Threading.Tasks;

namespace Final_QuizApp.Controllers
{
    [ApiController]
    [Route("api/QuizHost")]
    public class QuizHostPublicController : ControllerBase
    {
        private readonly QuizDbContext _context;
        public QuizHostPublicController(QuizDbContext context)
        {
            _context = context;
        }

        // POST: api/QuizHost/submit
        [HttpPost("submit")]
        public async Task<IActionResult> SubmitQuiz([FromBody] dynamic submission)
        {
            // Parse submission
            string quizId = submission.quizId;
            string email = submission.candidate.email;
            string fullName = submission.candidate.fullName;
            var answers = submission.answers;
            string feedback = submission.feedback;

            var quizQuestions = _context.Questions.Where(q => q.QuizEventId == quizId).ToList();
            int score = 0;
            var rightAnswers = new System.Collections.Generic.List<int>();
            var wrongAnswers = new System.Collections.Generic.List<int>();
            for (int i = 0; i < quizQuestions.Count; i++)
            {
                var q = quizQuestions[i];
                int correctIndex = int.TryParse(q.CorrectOption, out var idx) ? idx : 0;
                if (answers[i] != null && (int)answers[i] == correctIndex)
                {
                    score += q.Score;
                    rightAnswers.Add(i+1);
                }
                else
                {
                    wrongAnswers.Add(i+1);
                }
            }
            // Optionally save candidate info and feedback
            // TODO: Save to DB if needed
            return Ok(new {
                score,
                rightAnswers,
                wrongAnswers
            });
        }
    }
}
