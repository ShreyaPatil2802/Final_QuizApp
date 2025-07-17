using System.ComponentModel.DataAnnotations;

namespace Final_QuizApp.Models
{
    public class Question
    {
        public int Id { get; set; }

        [Required]
        public string Text { get; set; } = string.Empty;


        // Navigation property for event linkage
        public string QuizEventId { get; set; }
        public QuizEvent? QuizEvent { get; set; }

        public string CorrectOption { get; set; } = string.Empty;

        public List<Option> Options { get; set; } = new();
        public int Score { get; set; } = 1;
        public string Difficulty { get; set; } = "Easy";
    }
}
