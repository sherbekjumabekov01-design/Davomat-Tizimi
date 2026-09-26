using Backend.DTOs;

namespace Backend.Services;

public interface ITeacherService
{
    Task<IEnumerable<TeacherDto>> GetAllTeachersAsync(string? search = null);
    Task<TeacherDto?> GetTeacherByIdAsync(int id);
    Task<TeacherDto> CreateTeacherAsync(CreateTeacherDto dto);
    Task<TeacherDto?> UpdateTeacherAsync(int id, UpdateTeacherDto dto);
    Task<bool> DeleteTeacherAsync(int id);
}
