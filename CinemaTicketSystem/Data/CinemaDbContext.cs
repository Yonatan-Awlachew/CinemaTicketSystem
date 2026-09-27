using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using CinemaTicketSystem.Models;

namespace CinemaTicketSystem.Data
{
    public class CinemaDbContext : IdentityDbContext<User>
    {
        public CinemaDbContext(DbContextOptions<CinemaDbContext> options) 
            : base(options)
        {
        }

        // Only the entities we're actually using
        public DbSet<Cinema> Cinemas { get; set; }
        public DbSet<Screening> Screenings { get; set; }
        public DbSet<SeatReservation> SeatReservations { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            ConfigureEntities(modelBuilder);
            SeedRoles(modelBuilder);
            SeedData(modelBuilder);
        }

        private void ConfigureEntities(ModelBuilder modelBuilder)
        {
            // User configuration
            modelBuilder.Entity<User>(entity =>
            {
                entity.Property(e => e.RowVersion)
                    .IsRowVersion()
                    .IsConcurrencyToken();
            });

            // Cinema configuration
            modelBuilder.Entity<Cinema>(entity =>
            {
                entity.HasKey(e => e.Id);
            });

            // Screening configuration
            modelBuilder.Entity<Screening>(entity =>
            {
                entity.HasKey(e => e.Id);
                
                entity.Property(e => e.Price)
                    .HasPrecision(10, 2);
                
                entity.HasOne(e => e.Cinema)
                    .WithMany()
                    .HasForeignKey(e => e.CinemaId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // SeatReservation configuration
            modelBuilder.Entity<SeatReservation>(entity =>
            {
                entity.HasKey(e => e.Id);
                
                // CRITICAL: Unique constraint prevents double booking
                entity.HasIndex(e => new { e.ScreeningId, e.RowNumber, e.SeatNumber })
                    .IsUnique()
                    .HasDatabaseName("IX_SeatReservation_UniqueBooking");
                
                // Concurrency control
                entity.Property(e => e.RowVersion)
                    .IsRowVersion()
                    .IsConcurrencyToken();
                
                // Relationships
                entity.HasOne(e => e.Screening)
                    .WithMany()
                    .HasForeignKey(e => e.ScreeningId)
                    .OnDelete(DeleteBehavior.Cascade);
                
                entity.HasOne(e => e.User)
                    .WithMany()
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }

        private void SeedRoles(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<IdentityRole>().HasData(
                new IdentityRole 
                { 
                    Id = "1", 
                    Name = "Administrator", 
                    NormalizedName = "ADMINISTRATOR" 
                },
                new IdentityRole 
                { 
                    Id = "2", 
                    Name = "User", 
                    NormalizedName = "USER" 
                }
            );

            // Create admin users
            var hasher = new PasswordHasher<User>();
            
            var adminUser = new User
            {
                Id = "admin-id",
                UserName = "admin@cinema.com",
                NormalizedUserName = "ADMIN@CINEMA.COM",
                Email = "admin@cinema.com",
                NormalizedEmail = "ADMIN@CINEMA.COM",
                FirstName = "Admin",
                LastName = "User",
                EmailConfirmed = true,
                SecurityStamp = Guid.NewGuid().ToString()
            };
            adminUser.PasswordHash = hasher.HashPassword(adminUser, "Admin123!");

            var adminUser2 = new User
            {
                Id = "admin-id-2",
                UserName = "admin2@cinema.com",
                NormalizedUserName = "ADMIN2@CINEMA.COM",
                Email = "admin2@cinema.com",
                NormalizedEmail = "ADMIN2@CINEMA.COM",
                FirstName = "Admin2",
                LastName = "User",
                EmailConfirmed = true,
                SecurityStamp = Guid.NewGuid().ToString()
            };
            adminUser2.PasswordHash = hasher.HashPassword(adminUser2, "Admin12345@");

            modelBuilder.Entity<User>().HasData(adminUser, adminUser2);

            // Assign admin roles
            modelBuilder.Entity<IdentityUserRole<string>>().HasData(
                new IdentityUserRole<string>
                {
                    RoleId = "1",
                    UserId = "admin-id"
                },
                new IdentityUserRole<string>
                {
                    RoleId = "1",
                    UserId = "admin-id-2"
                }
            );
        }

        private void SeedData(ModelBuilder modelBuilder)
        {
            // Seed Cinemas only - Screenings should be added by admin
            modelBuilder.Entity<Cinema>().HasData(
                new Cinema { Id = 1, Name = "Cinema Hall 1", RowsCount = 10, SeatsPerRow = 15 },
                new Cinema { Id = 2, Name = "Cinema Hall 2", RowsCount = 8, SeatsPerRow = 12 },
                new Cinema { Id = 3, Name = "Cinema Hall 3", RowsCount = 6, SeatsPerRow = 10 }
            );

            // Note: Screenings are NOT seeded - admin must create them via API
        }
    }
}