using Final_QuizApp.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace Final_QuizApp
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container
            builder.Services.AddControllers();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            builder.Services.AddDbContext<QuizDbContext>(options =>
                options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

            // ✅ Add CORS policy
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowFrontend", policy =>
                {
                    policy.WithOrigins("https://localhost:7291") // Match your frontend origin
                          .AllowAnyHeader()
                          .AllowAnyMethod();
                });
            });

            // ✅ JWT Authentication
            builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        ValidIssuer = builder.Configuration["Jwt:Issuer"],
                        ValidAudience = builder.Configuration["Jwt:Issuer"],
                        IssuerSigningKey = new SymmetricSecurityKey(
                            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT key is missing")))
                    };
                });

            // ✅ Add SignalR
            builder.Services.AddSignalR();

           var app = builder.Build();

            // ✅ Enable Swagger
            app.UseSwagger();
            app.UseSwaggerUI();

            // ✅ Enable HTTPS redirection
            app.UseHttpsRedirection();

            // ✅ Enable CORS BEFORE authentication/authorization
            app.UseCors("AllowFrontend");

            // ✅ Enable authentication and authorization
            app.UseAuthentication();
            app.UseAuthorization();

            // ✅ Serve static files from "FrontEnd" folder
            // Serve home.html as the default file
            app.UseDefaultFiles(new DefaultFilesOptions
            {
                DefaultFileNames = new List<string> { "home.html" },
                FileProvider = new PhysicalFileProvider(
                    Path.Combine(Directory.GetCurrentDirectory(), "FrontEnd")),
                RequestPath = ""
            });
            app.UseStaticFiles(new StaticFileOptions
            {
                FileProvider = new PhysicalFileProvider(
                    Path.Combine(Directory.GetCurrentDirectory(), "FrontEnd")),
                RequestPath = ""
            });

            app.UseRouting();
            app.UseAuthorization();

            // Top-level route registrations
            app.MapControllers();
            app.MapHub<LeaderboardHub>("/leaderboardHub");
            app.MapHub<QuizHub>("/quizHub");
            app.MapFallback(context => {
                var path = context.Request.Path.Value;
                if (path != null && path.StartsWith("/quiz/"))
                {
                    context.Response.ContentType = "text/html";
                    return context.Response.SendFileAsync(Path.Combine("FrontEnd", "candidate.html"));
                }
                return context.Response.SendFileAsync(Path.Combine("FrontEnd", "home.html"));
            });

            app.Run();
        }
    }
}
