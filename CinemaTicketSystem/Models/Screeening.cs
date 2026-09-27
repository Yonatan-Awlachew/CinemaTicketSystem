using System.ComponentModel.DataAnnotations;

namespace CinemaTicketSystem.Models
{
    public class Screening
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(300)]
        public string FilmTitle { get; set; } = string.Empty;
        
        [Required]
        public int CinemaId { get; set; }
        
        [Required]
        public DateTime StartDateTime { get; set; }
        
        [Range(0, 1000)]
        public decimal Price { get; set; } = 10.00m;
        
        // Navigation property - only when needed
        public Cinema? Cinema { get; set; }
    }
}