using System;

namespace Final_QuizApp.Models
{
    public class QuizActivityLog
    {
        public int Id { get; set; }
        public string QuizId { get; set; }
        public string UserEmail { get; set; }
        public string UserName { get; set; }
        public string ActionType { get; set; } // e.g., "QuizStarted", "QuestionAnswered", "QuizEnded", "FeedbackSubmitted"
        public string Details { get; set; } // JSON or text for extra info (questionId, answer, etc.)
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}
