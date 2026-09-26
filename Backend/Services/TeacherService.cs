using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.DTOs;
using Backend.Models;

namespace Backend.Services;

public class TeacherService : ITeacherService
{
    private readonly AppDbContext _context;

    public TeacherService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<TeacherDto>> GetAllTeachersAsync(string? search = null)
    {
        var query = _context.Teachers
            .Include(t => t.Groups)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var sLower = search.Trim().ToLower();
            query = query.Where(t => 
                t.FullName.ToLower().Contains(sLower) || 
                t.Subject.ToLower().Contains(sLower) || 
                t.Email.ToLower().Contains(sLower));
        }

        var teachers = await query.ToListAsync();

        return teachers.Select(t => new TeacherDto
        {
            Id = t.Id,
            FullName = t.FullName,
            Email = t.Email,
            Phone = t.Phone,
            Subject = t.Subject,
            UserId = t.UserId,
            CreatedAt = t.CreatedAt,
            GroupIds = t.Groups.Select(g => g.Id).ToList(),
            GroupNames = t.Groups.Select(g => g.Name).ToList()
        });
    }

    public async Task<TeacherDto?> GetTeacherByIdAsync(int id)
    {
        var t = await _context.Teachers
            .Include(t => t.Groups)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (t == null) return null;

        return new TeacherDto
        {
            Id = t.Id,
            FullName = t.FullName,
            Email = t.Email,
            Phone = t.Phone,
            Subject = t.Subject,
            UserId = t.UserId,
            CreatedAt = t.CreatedAt,
            GroupIds = t.Groups.Select(g => g.Id).ToList(),
            GroupNames = t.Groups.Select(g => g.Name).ToList()
        };
    }

    public async Task<TeacherDto> CreateTeacherAsync(CreateTeacherDto dto)
    {
        var teacher = new Teacher
        {
            FullName = dto.FullName,
            Email = dto.Email,
            Phone = dto.Phone,
            Subject = dto.Subject,
            CreatedAt = DateTime.UtcNow
        };

        if (dto.GroupIds != null && dto.GroupIds.Any())
        {
            var groups = await _context.Groups.Where(g => dto.GroupIds.Contains(g.Id)).ToListAsync();
            teacher.Groups = groups;
        }

        _context.Teachers.Add(teacher);
        await _context.SaveChangesAsync();

        return new TeacherDto
        {
            Id = teacher.Id,
            FullName = teacher.FullName,
            Email = teacher.Email,
            Phone = teacher.Phone,
            Subject = teacher.Subject,
            UserId = teacher.UserId,
            CreatedAt = teacher.CreatedAt,
            GroupIds = teacher.Groups.Select(g => g.Id).ToList(),
            GroupNames = teacher.Groups.Select(g => g.Name).ToList()
        };
    }

    public async Task<TeacherDto?> UpdateTeacherAsync(int id, UpdateTeacherDto dto)
    {
        var teacher = await _context.Teachers.Include(t => t.Groups).FirstOrDefaultAsync(t => t.Id == id);
        if (teacher == null) return null;

        teacher.FullName = dto.FullName;
        teacher.Email = dto.Email;
        teacher.Phone = dto.Phone;
        teacher.Subject = dto.Subject;

        if (dto.GroupIds != null)
        {
            teacher.Groups.Clear();
            var groups = await _context.Groups.Where(g => dto.GroupIds.Contains(g.Id)).ToListAsync();
            teacher.Groups = groups;
        }

        await _context.SaveChangesAsync();

        return new TeacherDto
        {
            Id = teacher.Id,
            FullName = teacher.FullName,
            Email = teacher.Email,
            Phone = teacher.Phone,
            Subject = teacher.Subject,
            UserId = teacher.UserId,
            CreatedAt = teacher.CreatedAt,
            GroupIds = teacher.Groups.Select(g => g.Id).ToList(),
            GroupNames = teacher.Groups.Select(g => g.Name).ToList()
        };
    }

    public async Task<bool> DeleteTeacherAsync(int id)
    {
        var teacher = await _context.Teachers.FindAsync(id);
        if (teacher == null) return false;

        _context.Teachers.Remove(teacher);
        await _context.SaveChangesAsync();
        return true;
    }
}
