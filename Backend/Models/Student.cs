using System.Text.Json.Serialization;

namespace Backend.Models;

public enum StudentStatus
{
    Active = 1,     // Faol
    Frozen = 2,     // Muzlatilgan (Akademik ta'til / vaqtincha to'xtatgan)
    Dropped = 3,    // Tashlab ketgan / O'qishni to'xtatgan
    Graduated = 4   // Bitirgan / Kursni tamomlagan
}

public class Student
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string StudentCode { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string ParentPhone { get; set; } = string.Empty;
    public string ParentName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    
    public int GroupId { get; set; }
    public Group? Group { get; set; }
    
    public StudentStatus Status { get; set; } = StudentStatus.Active;
    public int Coins { get; set; } = 0;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [JsonIgnore]
    public ICollection<Attendance> Attendances { get; set; } = new List<Attendance>();
}
