using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Final_QuizApp.Models
{
    public class QuizEvent
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Title { get; set; } = string.Empty;
        public string Instructions { get; set; } = string.Empty;
        public int NumQuestions { get; set; }
        public string? FeedbackForm { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public int Duration { get; set; } // <-- Add Duration property
        public bool IsClosed { get; set; } = false;
        public List<Question> Questions { get; set; } = new();
    }
}
