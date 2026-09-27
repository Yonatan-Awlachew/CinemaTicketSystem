using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace CinemaTicketSystem.Data
{
    public class AppDbContextFactory : IDesignTimeDbContextFactory<CinemaDbContext>
    {
        public CinemaDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<CinemaDbContext>();

            // Use your Docker MySQL container connection
            optionsBuilder.UseMySql(
                "Server=127.0.0.1;Port=3307;Database=cinematicketsystem;User=cinema_user;Password=StrongPassword123;",
                new MySqlServerVersion(new Version(8, 0, 33))
            );

            return new CinemaDbContext(optionsBuilder.Options);
        }
    }
}
