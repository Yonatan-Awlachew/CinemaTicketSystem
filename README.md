# Cinema Ticket Booking System - Task 3

A web-based cinema ticket reservation system built with ASP.NET Core MVC and React, enabling users to browse screenings, manage accounts, and allowing administrators to control cinema operations.

## Project Information

**Course:** Graphical User Interface (EGUI)  
**Task:** Laboratory Task 3  
**Academic Year:** 2025-2026  
**Institution:** Warsaw University of Technology  
**Faculty:** Faculty of Electronics and Information Technology  
**Student:** Yonatan Firde  
**Project Repository:** [GitLab Repository](https://gitlab-stud.elka.pw.edu.pl/25z-egui/react/25Z-EGUI-REACT-Firde-Yonatan.git)

## Technology Stack

![.NET](https://img.shields.io/badge/.NET-9.0-512BD4?style=flat-square&logo=dotnet&logoColor=white)
![ASP.NET Core](https://img.shields.io/badge/ASP.NET%20Core-MVC-512BD4?style=flat-square&logo=.net&logoColor=white)
![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat-square&logo=react&logoColor=black)
![MySQL](https://img.shields.io/badge/MySQL-5.7.24-4479A1?style=flat-square&logo=mysql&logoColor=white)
![Entity Framework](https://img.shields.io/badge/Entity%20Framework-Core-512BD4?style=flat-square)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-7952B3?style=flat-square&logo=bootstrap&logoColor=white)

## System Architecture

- **Backend Framework:** ASP.NET Core 9.0 MVC
- **Frontend Framework:** React 19.2.3
- **ORM:** Entity Framework Core
- **Authentication:** ASP.NET Core Identity
- **Database:** MySQL 5.7.24
- **Styling:** Bootstrap 5.3
- **API:** RESTful Web API

## Task 3 Requirements - Implementation Status

### Completed Features

#### 1. User Registration and Profile Management
- **User Registration:** New users can register with email, password, full name, and phone number
- **Profile Editing:** Users can update their name, surname, and phone number
- **Administrator Controls:** Admins can modify any user's profile information
- **Form Validation:** Client-side and server-side validation for all input fields

#### 2. Concurrent User Management with Parallelism
- **Optimistic Concurrency Control:** Implemented using Entity Framework's concurrency tokens
- **Race Condition Prevention:** Thread-safe operations for simultaneous user edits
- **Conflict Detection:** Automatic detection and handling of concurrent modifications
- **Error Handling:** User-friendly messages when conflicts occur

#### 3. Screening Management (Admin Only)
- **Create Screenings:** Administrators can create new movie screenings
  - Assign cinema hall from predefined list
  - Set movie title
  - Specify date and time
  - Automatic validation of screening conflicts
- **Delete Screenings:** Remove screenings with cascade deletion of all associated reservations
- **No Edit Functionality:** As per requirements, screenings cannot be edited once created

## Features

### User Functionalities
- **Account Management:** Registration, login, logout, and profile management
- **Profile Updates:** Edit name, surname, and phone number
- **Screening Browser:** View all available movie screenings
- **Session Management:** Secure authentication with ASP.NET Core Identity

### Administrative Functionalities
- **User Management:** View, edit, and delete user accounts with concurrency control
- **Screening Management:** Create and delete movie screenings
- **Cinema Management:** View predefined cinema halls and seating configurations
- **Role-Based Access Control:** Separate permissions for users and administrators

## Project Structure
```
CinemaTicketSystem/
├── Controllers/              # MVC Controllers
│   ├── AccountController.cs      # User authentication & registration
│   ├── UserManagementController.cs   # Admin user management
│   ├── ScreeningController.cs    # Screening CRUD operations
│   └── HomeController.cs
├── Models/                   # Domain models
│   ├── ApplicationUser.cs    # Extended Identity user with concurrency token
│   ├── Cinema.cs             # Cinema hall entity
│   ├── Movie.cs
│   ├── Screening.cs          # Screening entity
│   ├── Seat.cs
│   ├── Booking.cs
│   └── Ticket.cs
├── ViewModels/              # View-specific models
│   ├── RegisterViewModel.cs
│   ├── LoginViewModel.cs
│   ├── ProfileViewModel.cs
│   ├── ProfileEditViewModel.cs
│   └── ScreeningCreateViewModel.cs
├── Views/                   # Razor views
│   ├── Account/
│   │   ├── Register.cshtml
│   │   ├── Login.cshtml
│   │   └── Profile.cshtml
│   ├── UserManagement/
│   │   ├── Index.cshtml
│   │   ├── Edit.cshtml
│   │   └── Delete.cshtml
│   ├── Screening/
│   │   ├── Index.cshtml
│   │   ├── Create.cshtml
│   │   └── Delete.cshtml
│   └── Shared/
│       └── _Layout.cshtml
├── Data/                    # Database context
│   ├── ApplicationDbContext.cs
│   └── Migrations/
├── wwwroot/                 # Static resources
│   ├── css/
│   ├── js/
│   └── lib/
├── appsettings.json
├── Program.cs
└── README.md
```

## Database Schema

### Core Tables (Task 3 Focus)

#### AspNetUsers
- **Id:** Primary key (GUID)
- **Email:** Unique user email
- **PasswordHash:** Encrypted password
- **FirstName:** User's first name
- **LastName:** User's last name
- **PhoneNumber:** Contact number
- **ConcurrencyStamp:** For optimistic concurrency control
- **RowVersion:** Timestamp for conflict detection

#### Cinemas
- **Id:** Primary key
- **Name:** Cinema name
- **Rows:** Number of rows (n)
- **SeatsPerRow:** Number of seats per row (m)

#### Movies
- **Id:** Primary key
- **Title:** Movie title
- **Description:** Optional description
- **Duration:** Movie length in minutes

#### Screenings
- **Id:** Primary key
- **CinemaId:** Foreign key to Cinemas
- **MovieTitle:** Title of the film
- **StartTime:** Date and time of screening
- **CreatedAt:** Timestamp

### Entity Relationships
- Cinema **1:N** Screening
- User **1:N** Booking (prepared for Task 4)
- Screening **1:N** Booking (prepared for Task 4)

## Installation and Setup

### Prerequisites
- **.NET SDK 9.0** or higher
- **Node.js 18.x** or higher (for React frontend)
- **MySQL Server 5.7.24** or higher
- **Visual Studio 2022** or **Visual Studio Code**
- **Git**

### Step 1: Clone the Repository
```bash
git clone https://gitlab-stud.elka.pw.edu.pl/25z-egui/mvc/25Z-EGUI-MVC-Firde-Yonatan.git
cd CinemaTicketSystem
```

### Step 2: Database Configuration

#### Create MySQL Database
```bash
mysql -u root -p
```
```sql
CREATE DATABASE CinemaDb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'cinema_user'@'localhost' IDENTIFIED BY 'cinema_pass123';
GRANT ALL PRIVILEGES ON CinemaDb.* TO 'cinema_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### Configure Connection String
Edit `appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Port=3306;Database=CinemaDb;Uid=cinema_user;Pwd=cinema_pass123;"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.EntityFrameworkCore": "Information"
    }
  },
  "AllowedHosts": "*"
}
```

### Step 3: Seed Initial Data

The database includes a seed script that populates:
- **Admin account**
- **Regular user accounts**
- **Cinema halls** with predefined seating configurations
- **Sample movies**
- **Sample screenings**

### Step 4: Install Dependencies and Run Migrations
```bash
# Restore NuGet packages
dotnet restore

# Apply database migrations
dotnet ef database update

# Run the application
dotnet run
```

### Step 5: Access the Application
- **Application URL:** `https://localhost:5087` or `http://localhost:5087`
- **Default Admin Credentials:**
  - Email: `admin@cinema.com`
  - Password: `Admin@123`
- **Default User Credentials:**
  - Email: `user@cinema.com`
  - Password: `User@123`

## Usage Guide

### For Users

#### 1. Registration
1. Navigate to the registration page
2. Fill in the registration form:
   - Email address (must be unique)
   - Password (minimum 6 characters, requires uppercase, lowercase, and number)
   - First name
   - Last name
   - Phone number
3. Click "Register" to create your account
4. Login with your new credentials

#### 2. Profile Management
1. Login to your account
2. Navigate to "Profile" from the menu
3. Click "Edit Profile"
4. Update your first name, last name, or phone number
5. Save changes

#### 3. Browse Screenings
1. Navigate to "Screenings" from the menu
2. View list of available movie screenings
3. See details: movie title, cinema, date, and time

### For Administrators

#### 1. Access Admin Panel
1. Login with administrative credentials
2. Navigate to "Admin Panel" from the menu

#### 2. User Management
1. Select "Manage Users" from admin panel
2. View list of all registered users
3. **Edit User:**
   - Click "Edit" next to user
   - Modify first name, last name, or phone number
   - System handles concurrent edits automatically
   - Save changes
4. **Delete User:**
   - Click "Delete" next to user
   - Confirm deletion
   - User account is permanently removed

#### 3. Screening Management
1. Select "Manage Screenings" from admin panel
2. **Create Screening:**
   - Click "Create New Screening"
   - Select cinema hall from dropdown
   - Enter movie title
   - Select date and time
   - Submit to create
   - System validates for conflicts
3. **Delete Screening:**
   - Click "Delete" next to screening
   - Confirm deletion
   - Screening and all associated bookings are removed

## Concurrency Control Implementation

### User Edit Conflicts
The system implements optimistic concurrency control to handle simultaneous user edits:

```csharp
// Concurrency token in ApplicationUser model
[ConcurrencyCheck]
public string ConcurrencyStamp { get; set; }
```

**Scenario:** Two admins edit the same user simultaneously
1. Admin A loads user profile (ConcurrencyStamp = "ABC123")
2. Admin B loads same user profile (ConcurrencyStamp = "ABC123")
3. Admin A saves changes → Success, ConcurrencyStamp updated to "DEF456"
4. Admin B tries to save → Conflict detected
5. System shows error: "User was modified by another user. Please reload."

### User Delete Conflicts
**Scenario:** One admin deletes while another edits
1. Admin A begins editing user
2. Admin B deletes the same user
3. Admin A tries to save → Error: "User no longer exists"
4. System redirects to user list with notification

## Testing Concurrency

### Test Case 1: Simultaneous User Edits
1. Open two browser windows/tabs as admin
2. Edit the same user in both windows
3. Save in first window → Success
4. Save in second window → Conflict error displayed

### Test Case 2: Edit During Delete
1. Open two browser windows/tabs as admin
2. Begin editing a user in first window
3. Delete the same user in second window
4. Try to save in first window → Error message displayed

## Task 3 Specific Validations

### User Registration Validation
- Email must be valid format and unique
- Password must meet complexity requirements
- First name and last name required
- Phone number format validation

### Screening Creation Validation
- Cinema selection required
- Movie title required (non-empty)
- Start time must be in the future
- No duplicate screenings (same cinema, same time)

### Profile Edit Validation
- First name and last name cannot be empty
- Phone number must be valid format
- Email cannot be changed (immutable)

## Troubleshooting

### Database Connection Issues
```bash
# Test MySQL connection
mysql -u cinema_user -p -h localhost CinemaDb

# Verify Entity Framework is working
dotnet ef database update
```

### Concurrency Testing Issues
- Ensure you're using different browser sessions or incognito windows
- Clear browser cache if changes don't appear
- Check server logs for concurrency exceptions

### Migration Errors
```bash
# Remove all migrations
dotnet ef migrations remove

# Create new migration
dotnet ef migrations add InitialCreate
dotnet ef database update
```

### Port Already in Use
Edit `Properties/launchSettings.json` to change the port number.

## References and Resources
- [ASP.NET Core Documentation](https://docs.microsoft.com/en-us/aspnet/core/)
- [Entity Framework Core Documentation](https://docs.microsoft.com/en-us/ef/core/)
- [Concurrency Tokens in EF Core](https://docs.microsoft.com/en-us/ef/core/saving/concurrency)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Bootstrap Documentation](https://getbootstrap.com/docs/)

## License
This project is developed for academic purposes as part of the EGUI course at Warsaw University of Technology. All rights reserved © 2025 Yonatan Firde.

---

**For questions or issues, please contact:**  
Email: yonatanawlachew1@gmail.com  