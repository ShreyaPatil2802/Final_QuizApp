using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace Final_QuizApp
{
    public class LeaderboardHub : Hub
    {
        // Called by backend when leaderboard changes
        public async Task SendLeaderboardUpdate(string quizId, object leaderboard)
        {
            await Clients.Group(quizId).SendAsync("LeaderboardUpdated", leaderboard);
        }

        // Called by frontend to join a quiz group
        public async Task JoinQuizGroup(string quizId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, quizId);
        }
    }
}
