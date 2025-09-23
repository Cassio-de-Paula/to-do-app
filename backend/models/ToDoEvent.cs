using System;
using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class ToDoEvent
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public string Title { get; set; } = "";

        public string? Description { get; set; }

        public bool IsDone { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Nova data de prazo
        public DateTime? Deadline { get; set; }

        // FK para User
        [Required]
        public Guid UserId { get; set; }
        public User? User { get; set; }

        public Guid? CategoryId { get; set; }
        public Category? Category { get; set; }
    }
}
