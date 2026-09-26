using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.DTOs;
using Backend.Models;

namespace Backend.Services;

public class StudentService : IStudentService
{
    private readonly AppDbContext _context;

    public StudentService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<StudentDto>> GetAllStudentsAsync(int? groupId = null, string? search = null, StudentStatus? status = null)
    {
        var query = _context.Students
            .Include(s => s.Group)
            .Include(s => s.Attendances)
            .AsQueryable();

        if (groupId.HasValue && groupId.Value > 0)
        {
            query = query.Where(s => s.GroupId == groupId.Value);
        }

        if (status.HasValue)
        {
            query = query.Where(s => s.Status == status.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var sLower = search.Trim().ToLower();
            query = query.Where(s => 
                s.FullName.ToLower().Contains(sLower) || 
                s.StudentCode.ToLower().Contains(sLower) ||
                s.Phone.ToLower().Contains(sLower) ||
                s.ParentPhone.ToLower().Contains(sLower) ||
                s.ParentName.ToLower().Contains(sLower));
        }

        var students = await query.OrderBy(s => s.FullName).ToListAsync();

        return students.Select(s =>
        {
            var total = s.Attendances.Count;
            var presentOrLate = s.Attendances.Count(a => a.Status == AttendanceStatus.Present || a.Status == AttendanceStatus.Late);
            var rate = total > 0 ? Math.Round((double)presentOrLate / total * 100, 1) : 100.0;

            return new StudentDto
            {
                Id = s.Id,
                FullName = s.FullName,
                StudentCode = s.StudentCode,
                Phone = s.Phone,
                ParentPhone = s.ParentPhone,
                ParentName = s.ParentName,
                Email = s.Email,
                GroupId = s.GroupId,
                GroupName = s.Group?.Name ?? string.Empty,
                Status = s.Status,
                Coins = s.Coins,
                CreatedAt = s.CreatedAt,
                AttendanceRate = rate
            };
        });
    }

    public async Task<StudentDto?> GetStudentByIdAsync(int id)
    {
        var s = await _context.Students
            .Include(s => s.Group)
            .Include(s => s.Attendances)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (s == null) return null;

        var total = s.Attendances.Count;
        var presentOrLate = s.Attendances.Count(a => a.Status == AttendanceStatus.Present || a.Status == AttendanceStatus.Late);
        var rate = total > 0 ? Math.Round((double)presentOrLate / total * 100, 1) : 100.0;

        return new StudentDto
        {
            Id = s.Id,
            FullName = s.FullName,
            StudentCode = s.StudentCode,
            Phone = s.Phone,
            ParentPhone = s.ParentPhone,
            ParentName = s.ParentName,
            Email = s.Email,
            GroupId = s.GroupId,
            GroupName = s.Group?.Name ?? string.Empty,
            Status = s.Status,
            Coins = s.Coins,
            CreatedAt = s.CreatedAt,
            AttendanceRate = rate
        };
    }

    public async Task<StudentDto> CreateStudentAsync(CreateStudentDto dto)
    {
        var student = new Student
        {
            FullName = dto.FullName,
            StudentCode = string.IsNullOrWhiteSpace(dto.StudentCode) ? $"STU-{DateTime.UtcNow.Ticks % 10000:D4}" : dto.StudentCode,
            Phone = dto.Phone,
            ParentPhone = dto.ParentPhone,
            ParentName = dto.ParentName,
            Email = dto.Email,
            GroupId = dto.GroupId,
            Status = dto.Status,
            CreatedAt = DateTime.UtcNow
        };

        _context.Students.Add(student);
        await _context.SaveChangesAsync();

        var group = await _context.Groups.FindAsync(dto.GroupId);

        return new StudentDto
        {
            Id = student.Id,
            FullName = student.FullName,
            StudentCode = student.StudentCode,
            Phone = student.Phone,
            ParentPhone = student.ParentPhone,
            ParentName = student.ParentName,
            Email = student.Email,
            GroupId = student.GroupId,
            GroupName = group?.Name ?? string.Empty,
            Status = student.Status,
            CreatedAt = student.CreatedAt,
            AttendanceRate = 100.0
        };
    }

    public async Task<StudentDto?> UpdateStudentAsync(int id, UpdateStudentDto dto)
    {
        var student = await _context.Students.Include(s => s.Group).FirstOrDefaultAsync(s => s.Id == id);
        if (student == null) return null;

        student.FullName = dto.FullName;
        if (!string.IsNullOrWhiteSpace(dto.StudentCode)) student.StudentCode = dto.StudentCode;
        student.Phone = dto.Phone;
        student.ParentPhone = dto.ParentPhone;
        student.ParentName = dto.ParentName;
        student.Email = dto.Email;
        student.GroupId = dto.GroupId;
        student.Status = dto.Status;

        await _context.SaveChangesAsync();

        var group = await _context.Groups.FindAsync(dto.GroupId);

        return new StudentDto
        {
            Id = student.Id,
            FullName = student.FullName,
            StudentCode = student.StudentCode,
            Phone = student.Phone,
            ParentPhone = student.ParentPhone,
            ParentName = student.ParentName,
            Email = student.Email,
            GroupId = student.GroupId,
            GroupName = group?.Name ?? string.Empty,
            Status = student.Status,
            CreatedAt = student.CreatedAt
        };
    }

    public async Task<bool> DeleteStudentAsync(int id)
    {
        var student = await _context.Students.FindAsync(id);
        if (student == null) return false;

        _context.Students.Remove(student);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<AttendanceRecordDto>> GetStudentAttendanceHistoryAsync(int studentId)
    {
        var records = await _context.Attendances
            .Include(a => a.Student)
            .Include(a => a.Group)
            .Where(a => a.StudentId == studentId)
            .OrderByDescending(a => a.Date)
            .ToListAsync();

        return records.Select(a => new AttendanceRecordDto
        {
            Id = a.Id,
            StudentId = a.StudentId,
            StudentName = a.Student?.FullName ?? string.Empty,
            StudentCode = a.Student?.StudentCode ?? string.Empty,
            GroupId = a.GroupId,
            GroupName = a.Group?.Name ?? string.Empty,
            Date = a.Date,
            Status = a.Status,
            Note = a.Note,
            MarkedBy = a.MarkedBy,
            CreatedAt = a.CreatedAt
        });
    }
}
