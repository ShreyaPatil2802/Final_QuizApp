﻿using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Final_QuizApp.Migrations
{
    /// <inheritdoc />
    public partial class AddQuizEventDuration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Duration",
                table: "QuizEvents",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Duration",
                table: "QuizEvents");
        }
    }
}
