using Final_QuizApp.Models;
using Microsoft.EntityFrameworkCore;

namespace Final_QuizApp.Data
{
    public class QuizDbContext : DbContext
    {
        public QuizDbContext(DbContextOptions<QuizDbContext> options) : base(options) { }


        public DbSet<User> Users { get; set; }
        public DbSet<Question> Questions { get; set; }
        public DbSet<Option> Options { get; set; }
        public DbSet<Admin> Admins { get; set; }
        public DbSet<QuizResult> QuizResults { get; set; }
        public DbSet<QuizActivityLog> QuizActivityLogs { get; set; }
        public DbSet<QuizEvent> QuizEvents { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Question>()
                .HasMany(q => q.Options)
                .WithOne(o => o.Question!)
                .HasForeignKey(o => o.QuestionId);

            modelBuilder.Entity<QuizEvent>()
                .HasMany(qe => qe.Questions)
                .WithOne(q => q.QuizEvent)
                .HasForeignKey(q => q.QuizEventId)
                .HasPrincipalKey(qe => qe.Id);
        }
    }
}


