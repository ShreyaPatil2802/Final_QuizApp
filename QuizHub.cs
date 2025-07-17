using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;
using System.Linq;
using Final_QuizApp.Data;
using Final_QuizApp.Models;

namespace Final_QuizApp
{
    public class QuizHub : Hub
    {
        private readonly QuizDbContext _context;
        public QuizHub(QuizDbContext context)
        {
            _context = context;
        }

        // Called by candidate when answering a question
        public async Task UpdateScore(string quizId, string email, int score)
        {
            // Update candidate's score in DB
            var result = _context.QuizResults.FirstOrDefault(r => r.QuizId == quizId && r.Email == email);
            if (result != null)
            {
                result.Score = score;
                _context.SaveChanges();
            }
            // Get updated leaderboard
            var leaderboard = _context.QuizResults
                .Where(r => r.QuizId == quizId)
                .OrderByDescending(r => r.Score)
                .Select(r => new {
                    email = r.Email,
                    fullName = r.FullName,
                    score = r.Score,
                    time = r.Time,
                    difficulty = r.Difficulty
                }).ToList();
            // Broadcast leaderboard update to all clients in this quiz group
            await Clients.Group(quizId).SendAsync("LeaderboardUpdated", leaderboard);
        }

        public override async Task OnConnectedAsync()
        {
            var httpContext = Context.GetHttpContext();
            var quizId = httpContext.Request.Query["quizId"].ToString();
            if (!string.IsNullOrEmpty(quizId))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, quizId);
            }
            await base.OnConnectedAsync();
        }
    }
}
