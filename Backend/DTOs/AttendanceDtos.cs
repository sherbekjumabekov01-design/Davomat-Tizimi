using Backend.Models;

namespace Backend.DTOs;

public class AttendanceRecordDto
{
    public int Id { get; set; }
    public int StudentId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public string StudentCode { get; set; } = string.Empty;
    public int GroupId { get; set; }
    public string GroupName { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public AttendanceStatus Status { get; set; }
    public string StatusText => Status switch
    {
        AttendanceStatus.Present => "Kelgan",
        AttendanceStatus.Absent => "Kelmadi",
        AttendanceStatus.Late => "Kechikdi",
        AttendanceStatus.Excused => "Sababli",
        _ => "Noma'lum"
    };
    public string? Note { get; set; }
    public string? MarkedBy { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class MarkAttendanceItemDto
{
    public int StudentId { get; set; }
    public AttendanceStatus Status { get; set; } = AttendanceStatus.Present;
    public string? Note { get; set; }
}

public class BatchAttendanceDto
{
    public int GroupId { get; set; }
    public DateTime Date { get; set; }
    public List<MarkAttendanceItemDto> Records { get; set; } = new();
}

public class DailyStatItem
{
    public string Date { get; set; } = string.Empty;
    public int Present { get; set; }
    public int Absent { get; set; }
    public int Late { get; set; }
    public int Excused { get; set; }
    public double Rate { get; set; }
}

public class AttendanceStatsDto
{
    public int TotalStudents { get; set; }
    public int TotalTeachers { get; set; }
    public int TotalGroups { get; set; }
    public int TodayPresent { get; set; }
    public int TodayAbsent { get; set; }
    public int TodayLate { get; set; }
    public int TodayExcused { get; set; }
    public double TodayRate { get; set; }
    public List<DailyStatItem> WeeklyStats { get; set; } = new();
}

public class MonthlyLessonDayDto
{
    public DateTime Date { get; set; }
    public string DateLabel { get; set; } = string.Empty;
    public int DayNumber { get; set; }
    public bool IsToday { get; set; }
}

public class StudentGridRowDto
{
    public int StudentId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string StudentCode { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public int Coins { get; set; }
    public StudentStatus Status { get; set; } = StudentStatus.Active;
    public int PresentCount { get; set; }
    public int AbsentCount { get; set; }
    public bool HasWarning { get; set; }
    public Dictionary<string, string?> DailyStatus { get; set; } = new();
}

public class MonthlyGridResponseDto
{
    public int GroupId { get; set; }
    public string GroupName { get; set; } = string.Empty;
    public string CourseName { get; set; } = string.Empty;
    public string TeacherName { get; set; } = string.Empty;
    public string Price { get; set; } = string.Empty;
    public string ScheduleTime { get; set; } = string.Empty;
    public string LessonDaysType { get; set; } = "Odd";
    public string RoomNumber { get; set; } = string.Empty;
    public int Capacity { get; set; }
    public string DateRange { get; set; } = string.Empty;
    public string Branch { get; set; } = string.Empty;
    public int Year { get; set; }
    public int Month { get; set; }
    public string MonthName { get; set; } = string.Empty;
    public List<MonthlyLessonDayDto> LessonDays { get; set; } = new();
    public List<StudentGridRowDto> Students { get; set; } = new();
}

public class ToggleAttendanceDto
{
    public int StudentId { get; set; }
    public int GroupId { get; set; }
    public DateTime Date { get; set; }
    public string? Status { get; set; }
}

public class UpdateCoinsDto
{
    public int StudentId { get; set; }
    public int DeltaCoins { get; set; }
}
