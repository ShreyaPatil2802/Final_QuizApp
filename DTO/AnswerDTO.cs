namespace Final_QuizApp.DTO
{
    public class AnswerDTO
    {
        public int QuestionId { get; set; }       // ID of the question (more reliable than index)
        public int SelectedOption { get; set; }   // Option number selected by the user

        public string OptionText { get; set; } = string.Empty;

    }
}
