using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Final_QuizApp.Migrations
{
    /// <inheritdoc />
    public partial class AddIsClosedToQuizEvent : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsClosed",
                table: "QuizEvents",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsClosed",
                table: "QuizEvents");
        }
    }
}
