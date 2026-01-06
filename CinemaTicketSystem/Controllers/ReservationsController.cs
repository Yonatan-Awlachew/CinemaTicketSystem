using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using CinemaTicketSystem.Data;
using CinemaTicketSystem.Models;

namespace CinemaTicketSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ReservationsController : ControllerBase
    {
        private readonly CinemaDbContext _context;
        private readonly UserManager<User> _userManager;

        public ReservationsController(CinemaDbContext context, UserManager<User> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        // POST: api/reservations
        [HttpPost]
        public async Task<ActionResult> ReserveSeat([FromBody] ReserveSeatRequest request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            // Validate screening
            var screening = await _context.Screenings
                .Include(s => s.Cinema)
                .FirstOrDefaultAsync(s => s.Id == request.ScreeningId);

            if (screening == null)
            {
                return NotFound(new { message = "Screening not found" });
            }

            if (screening.StartDateTime <= DateTime.Now)
            {
                return BadRequest(new { message = "Cannot reserve seats for past screenings" });
            }

            // Validate seat position
            if (request.RowNumber < 1 || request.RowNumber > screening.Cinema!.RowsCount ||
                request.SeatNumber < 1 || request.SeatNumber > screening.Cinema.SeatsPerRow)
            {
                return BadRequest(new { message = "Invalid seat position" });
            }

            // Create reservation
            var reservation = new SeatReservation
            {
                ScreeningId = request.ScreeningId,
                UserId = userId,
                RowNumber = request.RowNumber,
                SeatNumber = request.SeatNumber,
                ReservationDateTime = DateTime.UtcNow
            };

            _context.SeatReservations.Add(reservation);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                if (ex.InnerException?.Message.Contains("IX_SeatReservation_UniqueBooking") == true ||
                    ex.InnerException?.Message.Contains("duplicate key") == true)
                {
                    return Conflict(new 
                    { 
                        message = "This seat is already reserved. Choose another seat.",
                        code = "SEAT_ALREADY_RESERVED"
                    });
                }
                
                return StatusCode(500, new { message = "Error occurred while reserving seat" });
            }

            var user = await _userManager.FindByIdAsync(userId);

            return Ok(new
            {
                id = reservation.Id,
                screeningId = reservation.ScreeningId,
                userId = reservation.UserId,
                userEmail = user?.Email ?? "",
                userName = $"{user?.FirstName} {user?.LastName}",
                rowNumber = reservation.RowNumber,
                seatNumber = reservation.SeatNumber,
                reservationDateTime = reservation.ReservationDateTime,
                filmTitle = screening.FilmTitle,
                cinemaName = screening.Cinema?.Name,
                startDateTime = screening.StartDateTime
            });
        }

        // DELETE: api/reservations/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> CancelReservation(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var reservation = await _context.SeatReservations
                .Include(r => r.Screening)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (reservation == null)
            {
                return NotFound(new { message = "Reservation not found" });
            }

            var isAdmin = User.IsInRole("Administrator");
            if (reservation.UserId != userId && !isAdmin)
            {
                return Forbid();
            }

            if (reservation.Screening!.StartDateTime <= DateTime.Now)
            {
                return BadRequest(new { message = "Cannot cancel reservation for started screenings" });
            }

            _context.SeatReservations.Remove(reservation);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Reservation cancelled successfully" });
        }

        // GET: api/reservations/5
        [HttpGet("{id}")]
        public async Task<ActionResult> GetReservation(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var reservation = await _context.SeatReservations
                .Include(r => r.Screening)
                    .ThenInclude(s => s!.Cinema)
                .Include(r => r.User)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (reservation == null)
            {
                return NotFound(new { message = "Reservation not found" });
            }

            var isAdmin = User.IsInRole("Administrator");
            if (reservation.UserId != userId && !isAdmin)
            {
                return Forbid();
            }

            return Ok(new
            {
                id = reservation.Id,
                screeningId = reservation.ScreeningId,
                userId = reservation.UserId,
                userEmail = reservation.User?.Email ?? "",
                userName = $"{reservation.User?.FirstName} {reservation.User?.LastName}",
                rowNumber = reservation.RowNumber,
                seatNumber = reservation.SeatNumber,
                reservationDateTime = reservation.ReservationDateTime,
                filmTitle = reservation.Screening?.FilmTitle,
                cinemaName = reservation.Screening?.Cinema?.Name,
                startDateTime = reservation.Screening?.StartDateTime
            });
        }

        // GET: api/reservations/my
        [HttpGet("my")]
        public async Task<ActionResult> GetMyReservations()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var reservations = await _context.SeatReservations
                .Include(r => r.Screening)
                    .ThenInclude(s => s!.Cinema)
                .Include(r => r.User)
                .Where(r => r.UserId == userId)
                .OrderByDescending(r => r.ReservationDateTime)
                .ToListAsync();

            var result = reservations.Select(r => new
            {
                id = r.Id,
                screeningId = r.ScreeningId,
                userId = r.UserId,
                userEmail = r.User?.Email ?? "",
                userName = $"{r.User?.FirstName} {r.User?.LastName}",
                rowNumber = r.RowNumber,
                seatNumber = r.SeatNumber,
                reservationDateTime = r.ReservationDateTime,
                filmTitle = r.Screening?.FilmTitle,
                cinemaName = r.Screening?.Cinema?.Name,
                startDateTime = r.Screening?.StartDateTime
            }).ToList();

            return Ok(result);
        }

        // GET: api/reservations/screening/5
        [HttpGet("screening/{screeningId}")]
        public async Task<ActionResult> GetReservedSeats(int screeningId)
        {
            var screening = await _context.Screenings.FindAsync(screeningId);
            if (screening == null)
            {
                return NotFound(new { message = "Screening not found" });
            }

            var reservedSeats = await _context.SeatReservations
                .Include(r => r.User)
                .Where(r => r.ScreeningId == screeningId)
                .Select(r => new
                {
                    rowNumber = r.RowNumber,
                    seatNumber = r.SeatNumber,
                    userName = $"{r.User!.FirstName} {r.User.LastName}"
                })
                .ToListAsync();

            return Ok(reservedSeats);
        }
    }

    // Request model
    public class ReserveSeatRequest
    {
        public int ScreeningId { get; set; }
        public int RowNumber { get; set; }
        public int SeatNumber { get; set; }
    }
}