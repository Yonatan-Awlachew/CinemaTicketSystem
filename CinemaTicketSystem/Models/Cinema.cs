using System.ComponentModel.DataAnnotations;

namespace CinemaTicketSystem.Models
{
    public class Cinema
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        [Range(1, 50)]
        public int RowsCount { get; set; }
        
        [Required]
        [Range(1, 50)]
        public int SeatsPerRow { get; set; }
    }
}