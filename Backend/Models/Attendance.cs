namespace Backend.Models;

public enum AttendanceStatus
{
    Present = 1, // Kelgan
    Absent = 2,  // Kelmadi
    Late = 3,    // Kechikdi
    Excused = 4  // Sababli
}

public class Attendance
{
    public int Id { get; set; }
    
    public int StudentId { get; set; }
    public Student? Student { get; set; }
    
    public int GroupId { get; set; }
    public Group? Group { get; set; }
    
    public DateTime Date { get; set; }
    public AttendanceStatus Status { get; set; } = AttendanceStatus.Present;
    public int? LateMinutes { get; set; }
    public string? Note { get; set; }
    public string? MarkedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
