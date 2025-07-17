namespace Final_QuizApp.DTO
{
    public class QuestionDTO
    {
        public string Text { get; set; } = string.Empty;
        public string QuizEventId { get; set; } = string.Empty;
        public string CorrectOption { get; set; } = string.Empty;
        public List<OptionDTO> Options { get; set; } = new();
        public int Number { get; set; }
        public string Difficulty { get; set; } = "Easy";
    }

   
    
}
