using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace CinemaTicketSystem.Data
{
    public class AppDbContextFactory : IDesignTimeDbContextFactory<CinemaDbContext>
    {
        public CinemaDbContext CreateDbContext(string[] args)
        {
            // Mirrors Program.cs: reads appsettings.json + user-secrets, so `dotnet ef`
            // uses the same connection string as `dotnet run` instead of a hardcoded one.
            var configuration = new ConfigurationBuilder()
                .SetBasePath(AppContext.BaseDirectory)
                .AddJsonFile("appsettings.json", optional: true)
                .AddUserSecrets<CinemaDbContext>(optional: true)
                .AddEnvironmentVariables()
                .Build();

            var connectionString = configuration.GetConnectionString("DefaultConnection");
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                throw new InvalidOperationException(
                    "ConnectionStrings:DefaultConnection is not set. Run " +
                    "'dotnet user-secrets set \"ConnectionStrings:DefaultConnection\" \"...\"' " +
                    "or set the ConnectionStrings__DefaultConnection environment variable.");
            }

            var optionsBuilder = new DbContextOptionsBuilder<CinemaDbContext>();
            optionsBuilder.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString));

            return new CinemaDbContext(optionsBuilder.Options);
        }
    }
}
