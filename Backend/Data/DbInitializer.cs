using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data;

public static class DbInitializer
{
    public static async Task SeedAsync(AppDbContext context)
    {
        await context.Database.EnsureCreatedAsync();

        // Safe SQLite schema upgrades for existing database
        try { await context.Database.ExecuteSqlRawAsync("ALTER TABLE Groups ADD COLUMN LessonDaysType TEXT DEFAULT 'Odd';"); } catch { }
        try { await context.Database.ExecuteSqlRawAsync("ALTER TABLE Groups ADD COLUMN TeacherId INTEGER NULL;"); } catch { }
        try { await context.Database.ExecuteSqlRawAsync("ALTER TABLE Students ADD COLUMN ParentName TEXT DEFAULT '';"); } catch { }
        try { await context.Database.ExecuteSqlRawAsync("ALTER TABLE Students ADD COLUMN Status INTEGER DEFAULT 1;"); } catch { }
        try { await context.Database.ExecuteSqlRawAsync("ALTER TABLE Attendances ADD COLUMN LateMinutes INTEGER NULL;"); } catch { }

        if (await context.Users.AnyAsync())
        {
            return; // DB has already been seeded
        }

        // 1. Seed Users
        var adminPasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!");
        var teacherPasswordHash = BCrypt.Net.BCrypt.HashPassword("Teacher123!");

        var adminUser = new User
        {
            Username = "admin",
            Email = "admin@davomat.uz",
            PasswordHash = adminPasswordHash,
            FullName = "Administrator (Direktor)",
            Role = "Admin",
            CreatedAt = DateTime.UtcNow
        };

        var teacherUser1 = new User
        {
            Username = "alisher",
            Email = "alisher.qodirov@davomat.uz",
            PasswordHash = teacherPasswordHash,
            FullName = "Alisher Qodirov",
            Role = "Teacher",
            CreatedAt = DateTime.UtcNow
        };

        var teacherUser2 = new User
        {
            Username = "dilnoza",
            Email = "dilnoza.usmonova@davomat.uz",
            PasswordHash = teacherPasswordHash,
            FullName = "Dilnoza Usmonova",
            Role = "Teacher",
            CreatedAt = DateTime.UtcNow
        };

        context.Users.AddRange(adminUser, teacherUser1, teacherUser2);
        await context.SaveChangesAsync();

        // 2. Seed Groups
        var group1 = new Group
        {
            Name = "G1",
            Description = "Foundation - C++,Python",
            CourseYear = 1,
            RoomNumber = "6-xona",
            Price = "695 000 UZS",
            ScheduleTime = "Toq kunlar • 14:00",
            Capacity = 20,
            TeacherName = "Abdulhayev Jasur",
            DateRange = "29.04.2026 — 29.02.2028",
            Branch = "IT LIVE o'quv markazi",
            CreatedAt = DateTime.UtcNow
        };

        var group2 = new Group
        {
            Name = "G2",
            Description = "Frontend React & Next.js",
            CourseYear = 2,
            RoomNumber = "4-xona",
            Price = "750 000 UZS",
            ScheduleTime = "Juft kunlar • 16:00",
            Capacity = 18,
            TeacherName = "Alisher Qodirov",
            DateRange = "01.05.2026 — 01.12.2027",
            Branch = "IT LIVE o'quv markazi",
            CreatedAt = DateTime.UtcNow
        };

        var group3 = new Group
        {
            Name = "G-3",
            Description = "Backend .NET Core & SQL",
            CourseYear = 2,
            RoomNumber = "8-xona",
            Price = "800 000 UZS",
            ScheduleTime = "Toq kunlar • 18:30",
            Capacity = 22,
            TeacherName = "Rustam Karimov",
            DateRange = "15.06.2026 — 15.06.2028",
            Branch = "IT LIVE o'quv markazi",
            CreatedAt = DateTime.UtcNow
        };

        context.Groups.AddRange(group1, group2, group3);
        await context.SaveChangesAsync();

        // 3. Seed Teachers
        var teacher1 = new Teacher
        {
            FullName = "Abdulhayev Jasur",
            Email = "jasur.abdulhayev@davomat.uz",
            Phone = "+998 90 123 45 67",
            Subject = "Foundation - C++, Python",
            UserId = teacherUser1.Id,
            CreatedAt = DateTime.UtcNow,
            Groups = new List<Group> { group1 }
        };

        var teacher2 = new Teacher
        {
            FullName = "Alisher Qodirov",
            Email = "alisher.qodirov@davomat.uz",
            Phone = "+998 91 987 65 43",
            Subject = "Frontend Web Dasturlash",
            UserId = teacherUser2.Id,
            CreatedAt = DateTime.UtcNow,
            Groups = new List<Group> { group2 }
        };

        var teacher3 = new Teacher
        {
            FullName = "Rustam Karimov",
            Email = "rustam.karimov@davomat.uz",
            Phone = "+998 93 555 77 88",
            Subject = "Backend & SQL Ma'lumotlar bazasi",
            CreatedAt = DateTime.UtcNow,
            Groups = new List<Group> { group3 }
        };

        context.Teachers.AddRange(teacher1, teacher2, teacher3);
        await context.SaveChangesAsync();

        // 4. Seed Students (matching screenshot)
        var students = new List<Student>
        {
            // Group 1 (G1)
            new Student { FullName = "Abduganiyev Abduvahhob", StudentCode = "STD-101", Phone = "(99) 321-31-50", ParentPhone = "(99) 111-22-33", Email = "abduvahhob@example.com", GroupId = group1.Id, Coins = 76 },
            new Student { FullName = "Abduhakimov Ilyosbek", StudentCode = "STD-102", Phone = "(90) 400-15-88", ParentPhone = "(90) 222-33-44", Email = "ilyosbek@example.com", GroupId = group1.Id, Coins = 50 },
            new Student { FullName = "Boymurodov Salohiddin", StudentCode = "STD-103", Phone = "(94) 580-01-79", ParentPhone = "(94) 333-44-55", Email = "salohiddin@example.com", GroupId = group1.Id, Coins = 120 },
            new Student { FullName = "Jamoliddinov Jahongir", StudentCode = "STD-104", Phone = "(33) 856-44-04", ParentPhone = "(33) 444-55-66", Email = "jahongir@example.com", GroupId = group1.Id, Coins = 85 },
            new Student { FullName = "Keldibekova Sadoqat", StudentCode = "STD-105", Phone = "(33) 488-49-42", ParentPhone = "(33) 555-66-77", Email = "sadoqat@example.com", GroupId = group1.Id, Coins = 276 },
            new Student { FullName = "Kunarboyev Jasurbek", StudentCode = "STD-106", Phone = "(95) 892-27-23", ParentPhone = "(95) 666-77-88", Email = "jasurbek@example.com", GroupId = group1.Id, Coins = 95 },
            new Student { FullName = "Madatov Elmurod", StudentCode = "STD-107", Phone = "(94) 580-21-59", ParentPhone = "(94) 777-88-99", Email = "elmurod@example.com", GroupId = group1.Id, Coins = 110 },
            new Student { FullName = "Muhiddinov Behruz", StudentCode = "STD-108", Phone = "(90) 123-45-67", ParentPhone = "(90) 888-99-00", Email = "behruz@example.com", GroupId = group1.Id, Coins = 31 },
            new Student { FullName = "Toxirov Islombek", StudentCode = "STD-109", Phone = "(93) 333-44-55", ParentPhone = "(93) 999-00-11", Email = "islombek@example.com", GroupId = group1.Id, Coins = 238 }
        };

        context.Students.AddRange(students);
        await context.SaveChangesAsync();

        // 5. Seed Attendance for today and yesterday
        var today = DateTime.UtcNow.Date;
        var yesterday = today.AddDays(-1);

        var attendances = new List<Attendance>
        {
            // Today Group 1
            new Attendance { StudentId = students[0].Id, GroupId = group1.Id, Date = today, Status = AttendanceStatus.Present, MarkedBy = "Alisher Qodirov" },
            new Attendance { StudentId = students[1].Id, GroupId = group1.Id, Date = today, Status = AttendanceStatus.Present, MarkedBy = "Alisher Qodirov" },
            new Attendance { StudentId = students[2].Id, GroupId = group1.Id, Date = today, Status = AttendanceStatus.Late, Note = "15 daqiqa kechikdi (yo'l tirbandligi)", MarkedBy = "Alisher Qodirov" },
            new Attendance { StudentId = students[3].Id, GroupId = group1.Id, Date = today, Status = AttendanceStatus.Absent, Note = "Ogohlantirmagan", MarkedBy = "Alisher Qodirov" },
            new Attendance { StudentId = students[4].Id, GroupId = group1.Id, Date = today, Status = AttendanceStatus.Excused, Note = "Shifokor ma'lumotnomasi bor", MarkedBy = "Alisher Qodirov" },
            new Attendance { StudentId = students[5].Id, GroupId = group1.Id, Date = today, Status = AttendanceStatus.Present, MarkedBy = "Alisher Qodirov" },

            // Yesterday Group 1
            new Attendance { StudentId = students[0].Id, GroupId = group1.Id, Date = yesterday, Status = AttendanceStatus.Present, MarkedBy = "Alisher Qodirov" },
            new Attendance { StudentId = students[1].Id, GroupId = group1.Id, Date = yesterday, Status = AttendanceStatus.Present, MarkedBy = "Alisher Qodirov" },
            new Attendance { StudentId = students[2].Id, GroupId = group1.Id, Date = yesterday, Status = AttendanceStatus.Present, MarkedBy = "Alisher Qodirov" },
            new Attendance { StudentId = students[3].Id, GroupId = group1.Id, Date = yesterday, Status = AttendanceStatus.Present, MarkedBy = "Alisher Qodirov" },
            new Attendance { StudentId = students[4].Id, GroupId = group1.Id, Date = yesterday, Status = AttendanceStatus.Late, MarkedBy = "Alisher Qodirov" },
            new Attendance { StudentId = students[5].Id, GroupId = group1.Id, Date = yesterday, Status = AttendanceStatus.Present, MarkedBy = "Alisher Qodirov" },

            // Today Group 2
            new Attendance { StudentId = students[6].Id, GroupId = group2.Id, Date = today, Status = AttendanceStatus.Present, MarkedBy = "Dilnoza Usmonova" },
            new Attendance { StudentId = students[7].Id, GroupId = group2.Id, Date = today, Status = AttendanceStatus.Present, MarkedBy = "Dilnoza Usmonova" },
            new Attendance { StudentId = students[8].Id, GroupId = group2.Id, Date = today, Status = AttendanceStatus.Absent, MarkedBy = "Dilnoza Usmonova" },
            new Attendance { StudentId = students[9].Id, GroupId = group2.Id, Date = today, Status = AttendanceStatus.Present, MarkedBy = "Dilnoza Usmonova" },

            // Today Group 3
            new Attendance { StudentId = students[10].Id, GroupId = group3.Id, Date = today, Status = AttendanceStatus.Present, MarkedBy = "Alisher Qodirov" },
            new Attendance { StudentId = students[11].Id, GroupId = group3.Id, Date = today, Status = AttendanceStatus.Present, MarkedBy = "Alisher Qodirov" },
            new Attendance { StudentId = students[12].Id, GroupId = group3.Id, Date = today, Status = AttendanceStatus.Present, MarkedBy = "Alisher Qodirov" },
            new Attendance { StudentId = students[13].Id, GroupId = group3.Id, Date = today, Status = AttendanceStatus.Late, MarkedBy = "Alisher Qodirov" },
            new Attendance { StudentId = students[14].Id, GroupId = group3.Id, Date = today, Status = AttendanceStatus.Present, MarkedBy = "Alisher Qodirov" }
        };

        context.Attendances.AddRange(attendances);
        await context.SaveChangesAsync();
    }
}
