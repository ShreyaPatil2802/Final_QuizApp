namespace Final_QuizApp.Models
{
    public class QuizResult
    {
        public int Id { get; set; }
        public string QuizId { get; set; }
        public string Email { get; set; }
        public string FullName { get; set; }
        public int Score { get; set; }
        public string Time { get; set; }
        public string Difficulty { get; set; }
        public string Feedback { get; set; }
    }
}
