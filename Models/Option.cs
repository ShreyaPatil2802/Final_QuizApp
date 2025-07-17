namespace Final_QuizApp.Models
{
    public class Option
    {
        public int Id { get; set; }
        public int QuestionId { get; set; }
        public string OptionText { get; set; } = string.Empty;
        public int OptionNumber { get; set; }

        public Question? Question { get; set; }
    }
}
