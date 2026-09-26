using System.Text.Json.Serialization;

namespace Backend.Models;

public class Group
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int CourseYear { get; set; } = 1;
    public string RoomNumber { get; set; } = string.Empty;
    public string Price { get; set; } = "695 000 UZS";
    public string ScheduleTime { get; set; } = "Toq kunlar • 14:00";
    public int Capacity { get; set; } = 20;
    public int? TeacherId { get; set; }
    public Teacher? Teacher { get; set; }
    public string TeacherName { get; set; } = "Abdulhayev Jasur";
    public string LessonDaysType { get; set; } = "Odd"; // "Odd" (Du-Chor-Ju), "Even" (Se-Pay-Shan), "Daily" (Har kuni)
    public string DateRange { get; set; } = "29.04.2026 — 29.02.2028";
    public string Branch { get; set; } = "IT LIVE o'quv markazi";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [JsonIgnore]
    public ICollection<Student> Students { get; set; } = new List<Student>();

    [JsonIgnore]
    public ICollection<Teacher> Teachers { get; set; } = new List<Teacher>();
}
