namespace Final_QuizApp.Models
{
    public class Admin
    {
        public int Id { get; set; }                    // Primary key
        public string Username { get; set; }           // Unique admin username
        public string PasswordHash { get; set; }       // Store hashed password (or plain for now, but hashing is safer)
    }
}
