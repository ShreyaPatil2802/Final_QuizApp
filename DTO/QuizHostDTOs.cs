namespace Final_QuizApp.DTO
{
    public class LoginDTO
    {
        public string? Email { get; set; }
        public string? Password { get; set; }
    }

    public class QuizCreateDTO
    {
        public string? EventTitle { get; set; }
        public string? Instructions { get; set; }
        public int NumQuestions { get; set; }
        public int Duration { get; set; } // <-- Add Duration property
        public List<QuestionDTO>? Questions { get; set; }
        public string? FeedbackForm { get; set; }
    }

    // Remove duplicate QuestionDTO, use existing one in DTO folder

}
