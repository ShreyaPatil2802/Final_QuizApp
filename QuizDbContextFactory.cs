using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using System.IO;
using Final_QuizApp.Data;
namespace Final_QuizApp
{


        public class QuizDbContextFactory : IDesignTimeDbContextFactory<QuizDbContext>
        {
            public QuizDbContext CreateDbContext(string[] args)
            {
                var configuration = new ConfigurationBuilder()
                    .SetBasePath(Directory.GetCurrentDirectory()) // Important
                    .AddJsonFile("appsettings.json")
                    .Build();

                var optionsBuilder = new DbContextOptionsBuilder<QuizDbContext>();
                var connectionString = configuration.GetConnectionString("DefaultConnection");

                optionsBuilder.UseSqlServer(connectionString);

                return new QuizDbContext(optionsBuilder.Options);
            }
        }
    }



