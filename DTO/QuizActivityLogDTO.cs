using System.ComponentModel.DataAnnotations;

namespace Final_QuizApp.DTO
{
    public class QuizActivityLogDTO
    {
        [Required]
        public string QuizId { get; set; }
        public string UserEmail { get; set; }
        public string UserName { get; set; }
        [Required]
        public string ActionType { get; set; } // e.g., "QuizStarted", "QuestionAnswered", etc.
        public string Details { get; set; } // JSON or text for extra info
    }
}
