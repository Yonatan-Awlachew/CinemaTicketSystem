using System.ComponentModel.DataAnnotations;

namespace CinemaTicketSystem.Models
{
    public class SeatReservation
    {
        public int Id { get; set; }
        
        [Required]
        public int ScreeningId { get; set; }
        
        [Required]
        public string UserId { get; set; } = string.Empty;
        
        [Required]
        [Range(1, 50)]
        public int RowNumber { get; set; }
        
        [Required]
        [Range(1, 50)]
        public int SeatNumber { get; set; }
        
        [Required]
        public DateTime ReservationDateTime { get; set; } = DateTime.UtcNow;
        
        [Timestamp]
        public byte[]? RowVersion { get; set; }
        
        // Navigation properties - only when needed
        public Screening? Screening { get; set; }
        public User? User { get; set; }
    }
}