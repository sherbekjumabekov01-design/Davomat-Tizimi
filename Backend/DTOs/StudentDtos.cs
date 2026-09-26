using Backend.Models;

namespace Backend.DTOs;

public class StudentDto
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string StudentCode { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string ParentPhone { get; set; } = string.Empty;
    public string ParentName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public int GroupId { get; set; }
    public string GroupName { get; set; } = string.Empty;
    public StudentStatus Status { get; set; } = StudentStatus.Active;
    public int Coins { get; set; }
    public DateTime CreatedAt { get; set; }
    public double AttendanceRate { get; set; }
}

public class CreateStudentDto
{
    public string FullName { get; set; } = string.Empty;
    public string StudentCode { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string ParentPhone { get; set; } = string.Empty;
    public string ParentName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public int GroupId { get; set; }
    public StudentStatus Status { get; set; } = StudentStatus.Active;
}

public class UpdateStudentDto
{
    public string FullName { get; set; } = string.Empty;
    public string StudentCode { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string ParentPhone { get; set; } = string.Empty;
    public string ParentName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public int GroupId { get; set; }
    public StudentStatus Status { get; set; } = StudentStatus.Active;
}
