# Cinema Ticket Booking System

A cinema seat-booking web app: an ASP.NET Core 9 Web API (JWT auth, EF Core, MySQL) backing a separate React 19 + Vite single-page frontend.

## Project Information

**Course:** Graphical User Interface (EGUI)
**Institution:** Warsaw University of Technology
**Faculty:** Faculty of Electronics and Information Technology
**Student:** Yonatan Firde

## Technology Stack

![.NET](https://img.shields.io/badge/.NET-9.0-512BD4?style=flat-square&logo=dotnet&logoColor=white)
![ASP.NET Core](https://img.shields.io/badge/ASP.NET%20Core-Web%20API-512BD4?style=flat-square&logo=.net&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![MySQL](https://img.shields.io/badge/MySQL-8.x-4479A1?style=flat-square&logo=mysql&logoColor=white)
![Entity Framework](https://img.shields.io/badge/Entity%20Framework-Core-512BD4?style=flat-square)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-7952B3?style=flat-square&logo=bootstrap&logoColor=white)

- **Backend:** ASP.NET Core 9 Web API (no Razor views) + Entity Framework Core + Pomelo MySQL provider
- **Auth:** ASP.NET Core Identity, stateless **JWT bearer tokens** (no cookies)
- **Frontend:** React 19 (Vite), Bootstrap 5, plain `fetch()` — no router, no Redux
- **Database:** MySQL 8.x

## Features

- User registration/login (JWT), profile view/edit
- Browse screenings; admins can create/delete screenings (no editing — delete & recreate)
- Seat-level reservations with a seat map generated from each cinema's rows × seats-per-row
- **Double-booking prevention:** a unique DB index on `(ScreeningId, RowNumber, SeatNumber)` rejects a second reservation for the same seat even under concurrent requests
- **Optimistic concurrency control** on user-profile edits via a `RowVersion` column — a stale edit gets an HTTP 409 instead of silently overwriting someone else's change
- Admin user management (list/edit/delete users)

## Project Structure

```
CinemaTicketSystem/            ASP.NET Core 9 Web API
├── Controllers/
│   ├── AuthController.cs          register / login / JWT issuance
│   ├── CinemasController.cs       read-only cinema hall listing
│   ├── ScreeningsController.cs    create / list / delete screenings
│   ├── ReservationsController.cs  reserve / cancel seats
│   └── UsersController.cs         profile + admin user management
├── Data/
│   ├── CinemaDbContext.cs         EF Core model config + seed data
│   └── AppDbContextFactory.cs     design-time factory for `dotnet ef`
├── Models/                    User, Cinema, Screening, SeatReservation
├── Migrations/                 single InitialCreate migration
└── wwwroot/                    pre-built React app (served as static files)

Frontend/                       React 19 + Vite SPA
└── src/
    ├── context/AuthContext.jsx     global auth state (localStorage-backed)
    ├── services/                   fetch() wrappers per API area
    └── components/                 Login, Register, ScreeningsList, SeatSelection,
                                     MyReservations, Profile, EditProfile,
                                     AdminUserList, AdminCreateScreening
```

## Database Schema (core tables)

| Table | Key columns | Notes |
|---|---|---|
| AspNetUsers | Id, Email, PasswordHash, FirstName, LastName, PhoneNumber, RowVersion | Identity table + app's extra columns |
| Cinemas | Id, Name, RowsCount, SeatsPerRow | 3 rows seeded; seats are a computed grid, never stored individually |
| Screenings | Id, FilmTitle, CinemaId (FK), StartDateTime, Price | Created by an admin at runtime, none seeded |
| SeatReservations | Id, ScreeningId (FK), UserId (FK), RowNumber, SeatNumber, ReservationDateTime, RowVersion | `UNIQUE (ScreeningId, RowNumber, SeatNumber)` prevents double-booking |

Relationships: Cinema 1:N Screening · Screening 1:N SeatReservation · User 1:N SeatReservation (all cascade-delete).

## Installation and Setup

### Prerequisites
- .NET SDK 9.0+ (or a later SDK with `DOTNET_ROLL_FORWARD=LatestMajor` set)
- Node.js 18+
- MySQL 8.x (Docker recommended)
- Git

### 1. Start MySQL

The app expects MySQL reachable at **127.0.0.1:3307**, database `cinematicketsystem`, user `cinema_user`. Easiest via Docker:

```bash
docker run --name cinema-mysql \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=cinematicketsystem \
  -e MYSQL_USER=cinema_user \
  -e MYSQL_PASSWORD=StrongPassword123 \
  -p 3307:3306 \
  -d mysql:8.0
```

### 2. Configuration (secrets)

`appsettings.json` ships with **empty** `ConnectionStrings:DefaultConnection` and `Jwt:Key` on purpose — real values are never committed. Set them locally with `dotnet user-secrets` (they're stored outside the repo, per-machine):

```bash
cd CinemaTicketSystem
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=127.0.0.1;Port=3307;Database=cinematicketsystem;User=cinema_user;Password=StrongPassword123;"
dotnet user-secrets set "Jwt:Key" "some-random-string-at-least-32-characters-long"
```

For a non-dev deployment, set the equivalent environment variables instead:
`ConnectionStrings__DefaultConnection` and `Jwt__Key`.

### 3. Apply migrations and run the API

```bash
dotnet restore
dotnet ef database update    # creates all tables + seeds roles/admins/cinemas
dotnet run                   # http://localhost:5139
```

If `dotnet ef`/`dotnet run` complain about a missing net9.0 runtime because only a newer major SDK is installed, prefix the command with `DOTNET_ROLL_FORWARD=LatestMajor`.

### 4. Run the frontend

```bash
cd ../Frontend
npm install
npm run dev                  # http://localhost:5173, proxies /api to :5139
```

Or skip this step entirely — `CinemaTicketSystem/wwwroot/` already contains a built copy of the frontend, so `http://localhost:5139` alone serves both the UI and the API. To rebuild it after frontend changes: `npm run build` in `Frontend/`, then copy `dist/*` into `CinemaTicketSystem/wwwroot/`.

### Default seeded accounts

| Role | Email | Password |
|---|---|---|
| Administrator | admin@cinema.com | Admin123! |
| Administrator | admin2@cinema.com | Admin12345@ |

There is no seeded regular user — register one via the app's own Register form.

Swagger UI (Development only): `http://localhost:5139/swagger`.

## Testing Concurrency

**Double-booking:** open the same screening's seat map in two logged-in sessions, click the same seat in both within a second or two — one succeeds, the other gets `409 SEAT_ALREADY_RESERVED` and the grid auto-refreshes.

**Profile edit conflict:** as admin, open "Manage Users", edit the same user in two tabs, save in both — the second save gets `409 CONCURRENCY_CONFLICT` with a "Reload Latest Data" recovery option.

## Known Limitations

- No payment flow — reservations are free/instant; `Price` is display-only.
- Screenings can't be edited after creation, only deleted and recreated (deleting cascades to that screening's reservations with no warning).
- Frontend has no router — it's a single `currentView` state switch, so the URL never changes and there's no deep-linking or working back button.

## License

Developed for academic purposes as part of the EGUI course at Warsaw University of Technology. © 2025 Yonatan Firde.
