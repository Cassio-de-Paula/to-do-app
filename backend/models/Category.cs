using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;


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
        [JsonIgnore] // 🚀 evita loop infinito
        public ICollection<ToDoEvent>? ToDoEvents { get; set; }
    }
}
