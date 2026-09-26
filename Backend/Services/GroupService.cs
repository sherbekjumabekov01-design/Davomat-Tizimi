using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.DTOs;
using Backend.Models;

namespace Backend.Services;

public class GroupService : IGroupService
{
    private readonly AppDbContext _context;

    public GroupService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<GroupDto>> GetAllGroupsAsync()
    {
        var groups = await _context.Groups
            .Include(g => g.Students)
            .Include(g => g.Teacher)
            .OrderBy(g => g.Name)
            .ToListAsync();

        return groups.Select(g => new GroupDto
        {
            Id = g.Id,
            Name = g.Name,
            Description = g.Description,
            CourseYear = g.CourseYear,
            RoomNumber = g.RoomNumber,
            Price = g.Price,
            ScheduleTime = g.ScheduleTime,
            Capacity = g.Capacity,
            TeacherId = g.TeacherId,
            TeacherName = g.Teacher?.FullName ?? (!string.IsNullOrEmpty(g.TeacherName) ? g.TeacherName : "Tayinlanmagan"),
            LessonDaysType = g.LessonDaysType,
            DateRange = g.DateRange,
            Branch = g.Branch,
            StudentsCount = g.Students.Count,
            CreatedAt = g.CreatedAt
        });
    }

    public async Task<GroupDto?> GetGroupByIdAsync(int id)
    {
        var g = await _context.Groups
            .Include(g => g.Students)
            .Include(g => g.Teacher)
            .FirstOrDefaultAsync(g => g.Id == id);

        if (g == null) return null;

        return new GroupDto
        {
            Id = g.Id,
            Name = g.Name,
            Description = g.Description,
            CourseYear = g.CourseYear,
            RoomNumber = g.RoomNumber,
            Price = g.Price,
            ScheduleTime = g.ScheduleTime,
            Capacity = g.Capacity,
            TeacherId = g.TeacherId,
            TeacherName = g.Teacher?.FullName ?? (!string.IsNullOrEmpty(g.TeacherName) ? g.TeacherName : "Tayinlanmagan"),
            LessonDaysType = g.LessonDaysType,
            DateRange = g.DateRange,
            Branch = g.Branch,
            StudentsCount = g.Students.Count,
            CreatedAt = g.CreatedAt
        };
    }

    public async Task<GroupDto> CreateGroupAsync(CreateGroupDto dto)
    {
        string resolvedTeacherName = dto.TeacherName ?? string.Empty;
        if (dto.TeacherId.HasValue && dto.TeacherId.Value > 0)
        {
            var teacher = await _context.Teachers.FindAsync(dto.TeacherId.Value);
            if (teacher != null)
            {
                resolvedTeacherName = teacher.FullName;
            }
        }

        var group = new Group
        {
            Name = dto.Name,
            Description = dto.Description,
            CourseYear = dto.CourseYear,
            RoomNumber = dto.RoomNumber,
            TeacherId = dto.TeacherId > 0 ? dto.TeacherId : null,
            TeacherName = !string.IsNullOrEmpty(resolvedTeacherName) ? resolvedTeacherName : "Tayinlanmagan",
            LessonDaysType = string.IsNullOrEmpty(dto.LessonDaysType) ? "Odd" : dto.LessonDaysType,
            ScheduleTime = string.IsNullOrEmpty(dto.ScheduleTime) ? "Toq kunlar • 14:00" : dto.ScheduleTime,
            Price = string.IsNullOrEmpty(dto.Price) ? "695 000 UZS" : dto.Price,
            Capacity = dto.Capacity > 0 ? dto.Capacity : 20,
            DateRange = string.IsNullOrEmpty(dto.DateRange) ? "29.04.2026 — 29.02.2028" : dto.DateRange,
            Branch = string.IsNullOrEmpty(dto.Branch) ? "IT LIVE o'quv markazi" : dto.Branch,
            CreatedAt = DateTime.UtcNow
        };

        _context.Groups.Add(group);
        await _context.SaveChangesAsync();

        return new GroupDto
        {
            Id = group.Id,
            Name = group.Name,
            Description = group.Description,
            CourseYear = group.CourseYear,
            RoomNumber = group.RoomNumber,
            TeacherId = group.TeacherId,
            TeacherName = group.TeacherName,
            LessonDaysType = group.LessonDaysType,
            ScheduleTime = group.ScheduleTime,
            Price = group.Price,
            Capacity = group.Capacity,
            DateRange = group.DateRange,
            Branch = group.Branch,
            StudentsCount = 0,
            CreatedAt = group.CreatedAt
        };
    }

    public async Task<GroupDto?> UpdateGroupAsync(int id, UpdateGroupDto dto)
    {
        var group = await _context.Groups.Include(g => g.Students).FirstOrDefaultAsync(g => g.Id == id);
        if (group == null) return null;

        group.Name = dto.Name;
        group.Description = dto.Description;
        group.CourseYear = dto.CourseYear;
        group.RoomNumber = dto.RoomNumber;

        if (dto.TeacherId.HasValue)
        {
            group.TeacherId = dto.TeacherId.Value > 0 ? dto.TeacherId.Value : null;
            if (group.TeacherId.HasValue)
            {
                var teacher = await _context.Teachers.FindAsync(group.TeacherId.Value);
                if (teacher != null) group.TeacherName = teacher.FullName;
            }
        }
        if (!string.IsNullOrWhiteSpace(dto.TeacherName)) group.TeacherName = dto.TeacherName;
        if (!string.IsNullOrWhiteSpace(dto.LessonDaysType)) group.LessonDaysType = dto.LessonDaysType;
        if (!string.IsNullOrWhiteSpace(dto.ScheduleTime)) group.ScheduleTime = dto.ScheduleTime;
        if (!string.IsNullOrWhiteSpace(dto.Price)) group.Price = dto.Price;
        if (dto.Capacity > 0) group.Capacity = dto.Capacity;
        if (!string.IsNullOrWhiteSpace(dto.DateRange)) group.DateRange = dto.DateRange;
        if (!string.IsNullOrWhiteSpace(dto.Branch)) group.Branch = dto.Branch;

        await _context.SaveChangesAsync();

        return new GroupDto
        {
            Id = group.Id,
            Name = group.Name,
            Description = group.Description,
            CourseYear = group.CourseYear,
            RoomNumber = group.RoomNumber,
            TeacherId = group.TeacherId,
            TeacherName = group.TeacherName,
            LessonDaysType = group.LessonDaysType,
            ScheduleTime = group.ScheduleTime,
            Price = group.Price,
            Capacity = group.Capacity,
            DateRange = group.DateRange,
            Branch = group.Branch,
            StudentsCount = group.Students.Count,
            CreatedAt = group.CreatedAt
        };
    }

    public async Task<bool> DeleteGroupAsync(int id)
    {
        var group = await _context.Groups.Include(g => g.Students).FirstOrDefaultAsync(g => g.Id == id);
        if (group == null) return false;

        // If there are students, either disallow or cascade
        if (group.Students.Any())
        {
            return false; // prevent deleting group with students
        }

        _context.Groups.Remove(group);
        await _context.SaveChangesAsync();
        return true;
    }
}
