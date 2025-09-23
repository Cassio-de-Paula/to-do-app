using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class User
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required, EmailAddress]
        public string Email { get; set; } = "";
        [Required]
        public string Username { get; set; } = "";

        // para login externo (Google)
        public string? Provider { get; set; }
        public string? ProviderId { get; set; }

        public ICollection<ToDoEvent> ToDoEvents { get; set; } = new List<ToDoEvent>();
        public ICollection<Category> Categories { get; set; } = new List<Category>();

    }
}
