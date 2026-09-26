namespace Backend.DTOs;

public class GroupDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int CourseYear { get; set; }
    public string RoomNumber { get; set; } = string.Empty;
    public string Price { get; set; } = "695 000 UZS";
    public string ScheduleTime { get; set; } = "Toq kunlar • 14:00";
    public int Capacity { get; set; } = 20;
    public int? TeacherId { get; set; }
    public string TeacherName { get; set; } = string.Empty;
    public string LessonDaysType { get; set; } = "Odd";
    public string DateRange { get; set; } = "29.04.2026 — 29.02.2028";
    public string Branch { get; set; } = "IT LIVE o'quv markazi";
    public int StudentsCount { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateGroupDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int CourseYear { get; set; } = 1;
    public string RoomNumber { get; set; } = string.Empty;
    public int? TeacherId { get; set; }
    public string? TeacherName { get; set; }
    public string LessonDaysType { get; set; } = "Odd";
    public string ScheduleTime { get; set; } = "Toq kunlar • 14:00";
    public string Price { get; set; } = "695 000 UZS";
    public int Capacity { get; set; } = 20;
    public string DateRange { get; set; } = "29.04.2026 — 29.02.2028";
    public string Branch { get; set; } = "IT LIVE o'quv markazi";
}

public class UpdateGroupDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int CourseYear { get; set; } = 1;
    public string RoomNumber { get; set; } = string.Empty;
    public int? TeacherId { get; set; }
    public string? TeacherName { get; set; }
    public string LessonDaysType { get; set; } = "Odd";
    public string ScheduleTime { get; set; } = "Toq kunlar • 14:00";
    public string Price { get; set; } = "695 000 UZS";
    public int Capacity { get; set; } = 20;
    public string DateRange { get; set; } = "29.04.2026 — 29.02.2028";
    public string Branch { get; set; } = "IT LIVE o'quv markazi";
}
