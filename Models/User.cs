//namespace Final_QuizApp.Models
//{
//    public class User
//    {
//        public int Id { get; set; }
//        public string Username { get; set; }
//        //public string Email { get; set; } // Optional for login
//        public string Password { get; set; }
//        public int Score { get; set; } // For leaderboard
//        public bool IsAdmin { get; set; } = false;
//    }
//}


using System.ComponentModel.DataAnnotations;

namespace Final_QuizApp.Models
{
    public class User
    {
        public int Id { get; set; }

        [Required]
        [EmailAddress]
        public string Username { get; set; }  // Used as username and must be unique

        [Required]
        public string Password { get; set; }

        
        public string FirstName { get; set; }

        
        public string LastName { get; set; }

       public int Score { get; set; } = 0;

        public bool IsAdmin { get; set; } = false;
    }
}

