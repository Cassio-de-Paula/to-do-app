using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class Category
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public string Name { get; set; } = "";

        // Cor em hexadecimal, ex: "#FF0000"
        public string? Color { get; set; }

        // FK para User
        [Required]
        public Guid UserId { get; set; }
        public User? User { get; set; }

        // Lista de tarefas que pertencem a essa categoria
        public ICollection<ToDoEvent>? ToDoEvents { get; set; }
    }
}
