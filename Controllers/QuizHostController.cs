using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using Final_QuizApp.DTO;
using Microsoft.AspNetCore.SignalR;

namespace Final_QuizApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class QuizHostController : ControllerBase
    {
        // POST: api/QuizHost/login
        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginDTO login)
        {
            // TODO: Validate host credentials
            // No DB call, immediate response for fast login
            return Ok(new { success = true, hostName = login.Email });
        }

        private readonly Data.QuizDbContext _context;
        private readonly IHubContext<LeaderboardHub> _hubContext;
        public QuizHostController(Data.QuizDbContext context, IHubContext<LeaderboardHub> hubContext) { _context = context; _hubContext = hubContext; }

        // POST: api/QuizHost/create
        [HttpPost("create")]
        public IActionResult CreateQuiz([FromBody] QuizCreateDTO quiz)
        {
            string quizId = System.Guid.NewGuid().ToString();
            var quizEvent = new Final_QuizApp.Models.QuizEvent
            {
                Id = quizId,
                Title = quiz.EventTitle ?? "Quiz Event",
                Instructions = quiz.Instructions ?? string.Empty,
                NumQuestions = quiz.NumQuestions,
                FeedbackForm = quiz.FeedbackForm,
                CreatedAt = DateTime.UtcNow,
                Duration = quiz.Duration,
                Questions = new List<Final_QuizApp.Models.Question>()
            };
            if (quiz.Questions != null)
            {
                foreach (var q in quiz.Questions)
                {
                    var options = new List<Final_QuizApp.Models.Option>();
                    string correctOptionText = string.Empty;
                    for (int i = 0; i < q.Options.Count; i++)
                    {
                        var opt = q.Options[i];
                        string optText = opt.Text ?? opt.OptionText ?? string.Empty;
                        options.Add(new Final_QuizApp.Models.Option
                        {
                            OptionText = optText,
                            OptionNumber = i
                        });
                        // If correct option is stored as index string, match it
                        if (!string.IsNullOrEmpty(q.CorrectOption) && q.CorrectOption == (i+1).ToString())
                        {
                            correctOptionText = optText;
                        }
                    }
                    var question = new Final_QuizApp.Models.Question
                    {
                        Text = q.Text ?? string.Empty,
                        QuizEventId = quizId,
                        CorrectOption = correctOptionText, // Store the actual option text
                        Score = q.Number > 0 ? q.Number : 1,
                        Difficulty = string.IsNullOrEmpty(q.Difficulty) ? "Easy" : q.Difficulty,
                        Options = options
                    };
                    quizEvent.Questions.Add(question);
                    _context.Questions.Add(question);
                    _context.QuizActivityLogs.Add(new Final_QuizApp.Models.QuizActivityLog {
                        QuizId = quizId,
                        UserEmail = "host@system",
                        UserName = quiz.EventTitle ?? "Host",
                        ActionType = "QuestionAdded",
                        Details = $"Question: {q.Text}",
                        Timestamp = DateTime.UtcNow
                    });
                }
            }
            _context.QuizEvents.Add(quizEvent);
            _context.QuizActivityLogs.Add(new Final_QuizApp.Models.QuizActivityLog {
                QuizId = quizId,
                UserEmail = "host@system",
                UserName = quiz.EventTitle ?? "Host",
                ActionType = "QuizCreated",
                Details = $"Quiz created with {quiz.NumQuestions} questions.",
                Timestamp = DateTime.UtcNow
            });
            _context.SaveChanges();
            string quizLink = $"{Request.Scheme}://{Request.Host}/candidate.html?quizId={quizId}";
            return Ok(new { link = quizLink, quizId });
        }

        // POST: api/QuizHost/feedback
        [HttpPost("feedback")]
        public IActionResult SubmitFeedback([FromBody] FeedbackDTO feedback)
        {
            // Log feedback submission
            _context.QuizActivityLogs.Add(new Final_QuizApp.Models.QuizActivityLog {
                QuizId = feedback.QuizId,
                UserEmail = feedback.Email,
                UserName = feedback.FullName,
                ActionType = "FeedbackSubmitted",
                Details = feedback.Feedback,
                Timestamp = DateTime.UtcNow
            });

            // Simulate leaderboard update (replace with real DB logic)
            // Save candidate result to database
            var result = new Final_QuizApp.Models.QuizResult {
                QuizId = feedback.QuizId,
                Email = feedback.Email,
                FullName = feedback.FullName,
                Score = 80, // TODO: Calculate actual score
                Time = "7:00", // TODO: Calculate actual time
                Difficulty = "Easy", // TODO: Set actual difficulty
                Feedback = feedback.Feedback
            };
            _context.QuizResults.Add(result);
            _context.SaveChanges();

            // Get all results for this quiz
            var leaderboard = _context.QuizResults
                .Where(r => r.QuizId == feedback.QuizId)
                .OrderByDescending(r => r.Score)
                .Select(r => new {
                    email = r.Email,
                    fullName = r.FullName,
                    score = r.Score,
                    time = r.Time,
                    difficulty = r.Difficulty
                }).ToList();

            // Broadcast leaderboard update to all clients in this quiz group
            _hubContext.Clients.Group(feedback.QuizId).SendAsync("LeaderboardUpdated", leaderboard);
            return Ok(new { success = true });
        }

        // GET: api/QuizHost/leaderboard/{quizId}
        [HttpGet("leaderboard/{quizId}")]
        public IActionResult GetLeaderboard(string quizId)
        {
            // TODO: Fetch leaderboard for quiz
            var leaderboard = new List<object> {
                new { email = "alice@example.com", fullName = "Alice Smith", score = 90, time = "5:12", difficulty = "Hard" },
                new { email = "bob@example.com", fullName = "Bob Johnson", score = 90, time = "6:01", difficulty = "Medium" }
            };
            return Ok(leaderboard);
        }

        // POST: api/QuizHost/close/{quizId}
        [HttpPost("close/{quizId}")]
        public IActionResult CloseQuiz(string quizId)
        {
            var quiz = _context.QuizEvents.FirstOrDefault(q => q.Id == quizId);
            if (quiz == null)
                return NotFound(new { message = "Quiz not found" });
            quiz.IsClosed = false;
            _context.SaveChanges();
            // Optionally broadcast to clients
            _hubContext.Clients.Group(quizId).SendAsync("QuizClosed", quizId);
            return Ok(new { success = true });
        }

        // GET: api/QuizHost/event/{quizId}
        [HttpGet("event/{quizId}")]
        public IActionResult GetQuizEvent(string quizId, [FromQuery] string email = null)
        {
            try
            {
                // Debug: Log all quiz IDs and incoming quizId
                var allIds = _context.QuizEvents.Select(q => q.Id).ToList();
                System.Diagnostics.Debug.WriteLine($"Requested quizId: {quizId}");
                System.Diagnostics.Debug.WriteLine($"All quiz IDs: {string.Join(",", allIds)}");
                // Also log if quiz is found and its IsClosed status
                var quiz = _context.QuizEvents.FirstOrDefault(q => q.Id == quizId);
                if (quiz == null)
                {
                    System.Diagnostics.Debug.WriteLine($"Quiz not found for quizId: {quizId}");
                    return NotFound(new { message = $"Quiz not found. Requested: {quizId}. Available: {string.Join(",", allIds)}" });
                }
                System.Diagnostics.Debug.WriteLine($"Quiz found. IsClosed: {quiz.IsClosed}");
                if (quiz.IsClosed)
                {
                    System.Diagnostics.Debug.WriteLine($"Quiz is closed for quizId: {quizId}");
                    return Ok(new { isClosed = true });
                }
                // Check if already submitted
                if (!string.IsNullOrEmpty(email))
                {
                    var alreadySubmitted = _context.QuizResults.Any(r => r.QuizId == quizId && r.Email == email);
                    System.Diagnostics.Debug.WriteLine($"Already submitted for email {email}: {alreadySubmitted}");
                    if (alreadySubmitted)
                        return Ok(new { alreadySubmitted = true });
                }
                System.Diagnostics.Debug.WriteLine($"Returning quiz event for quizId: {quizId}");
                // Project only required fields to avoid object cycles
                var questions = _context.Questions
                    .Where(q => q.QuizEventId == quizId)
                    .Select(q => new {
                        q.Id,
                        q.Text,
                        q.CorrectOption,
                        q.Score,
                        q.Difficulty,
                        Options = q.Options.Select(o => new { o.OptionText, o.OptionNumber }).ToList()
                    }).ToList();
                return Ok(new {
                    eventTitle = quiz.Title,
                    instructions = quiz.Instructions,
                    duration = quiz.Duration,
                    numQuestions = quiz.NumQuestions,
                    feedbackForm = quiz.FeedbackForm,
                    isClosed = quiz.IsClosed,
                    createdAt = quiz.CreatedAt,
                    questions = questions
                });
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Exception in GetQuizEvent: {ex.Message}");
                return StatusCode(500, new { message = "Internal server error", details = ex.Message });
            }
        }
    }
}
