using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CinemaTicketSystem.Data;
using CinemaTicketSystem.Models;

namespace CinemaTicketSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ScreeningsController : ControllerBase
    {
        private readonly CinemaDbContext _context;

        public ScreeningsController(CinemaDbContext context)
        {
            _context = context;
        }

        // GET: api/screenings
        [HttpGet]
        public async Task<ActionResult> GetScreenings()
        {
            var screenings = await _context.Screenings
                .Include(s => s.Cinema)
                .OrderBy(s => s.StartDateTime)
                .ToListAsync();

            var result = new List<object>();
            
            foreach (var s in screenings)
            {
                var reservedCount = await _context.SeatReservations
                    .CountAsync(r => r.ScreeningId == s.Id);
                
                var totalSeats = s.Cinema!.RowsCount * s.Cinema.SeatsPerRow;
                
                result.Add(new
                {
                    id = s.Id,
                    filmTitle = s.FilmTitle,
                    cinemaId = s.CinemaId,
                    cinemaName = s.Cinema?.Name ?? "Unknown",
                    startDateTime = s.StartDateTime,
                    price = s.Price,
                    availableSeats = totalSeats - reservedCount,
                    totalSeats
                });
            }

            return Ok(result);
        }

        // GET: api/screenings/5
        [HttpGet("{id}")]
        public async Task<ActionResult> GetScreening(int id)
        {
            var screening = await _context.Screenings
                .Include(s => s.Cinema)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (screening == null)
            {
                return NotFound(new { message = "Screening not found" });
            }

            var reservedCount = await _context.SeatReservations
                .CountAsync(r => r.ScreeningId == id);
            
            var totalSeats = screening.Cinema!.RowsCount * screening.Cinema.SeatsPerRow;

            return Ok(new
            {
                id = screening.Id,
                filmTitle = screening.FilmTitle,
                cinemaId = screening.CinemaId,
                cinemaName = screening.Cinema?.Name ?? "Unknown",
                startDateTime = screening.StartDateTime,
                price = screening.Price,
                availableSeats = totalSeats - reservedCount,
                totalSeats
            });
        }

        // POST: api/screenings
        [HttpPost]
        [Authorize(Roles = "Administrator")]
        public async Task<ActionResult> CreateScreening([FromBody] CreateScreeningRequest request)
        {
            var cinema = await _context.Cinemas.FindAsync(request.CinemaId);
            if (cinema == null)
            {
                return BadRequest(new { message = "Cinema not found" });
            }

            if (request.StartDateTime <= DateTime.Now)
            {
                return BadRequest(new { message = "Screening must be scheduled for future" });
            }

            var screening = new Screening
            {
                FilmTitle = request.FilmTitle,
                CinemaId = request.CinemaId,
                StartDateTime = request.StartDateTime,
                Price = request.Price
            };

            _context.Screenings.Add(screening);
            await _context.SaveChangesAsync();

            var totalSeats = cinema.RowsCount * cinema.SeatsPerRow;
            
            return Ok(new
            {
                id = screening.Id,
                filmTitle = screening.FilmTitle,
                cinemaId = screening.CinemaId,
                cinemaName = cinema.Name,
                startDateTime = screening.StartDateTime,
                price = screening.Price,
                availableSeats = totalSeats,
                totalSeats
            });
        }

        // DELETE: api/screenings/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Administrator")]
        public async Task<IActionResult> DeleteScreening(int id)
        {
            var screening = await _context.Screenings.FindAsync(id);
            if (screening == null)
            {
                return NotFound(new { message = "Screening not found" });
            }

            var hasReservations = await _context.SeatReservations
                .AnyAsync(r => r.ScreeningId == id);
            
            if (hasReservations)
            {
                return BadRequest(new 
                { 
                    message = "Cannot delete screening with reservations. Cancel reservations first." 
                });
            }

            _context.Screenings.Remove(screening);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Screening deleted successfully" });
        }
    }

    // Request model
    public class CreateScreeningRequest
    {
        public string FilmTitle { get; set; } = string.Empty;
        public int CinemaId { get; set; }
        public DateTime StartDateTime { get; set; }
        public decimal Price { get; set; }
    }
}