using Backend.DTOs;
using Backend.Models;

namespace Backend.Services;

public interface IStudentService
{
    Task<IEnumerable<StudentDto>> GetAllStudentsAsync(int? groupId = null, string? search = null, StudentStatus? status = null);
    Task<StudentDto?> GetStudentByIdAsync(int id);
    Task<StudentDto> CreateStudentAsync(CreateStudentDto dto);
    Task<StudentDto?> UpdateStudentAsync(int id, UpdateStudentDto dto);
    Task<bool> DeleteStudentAsync(int id);
    Task<IEnumerable<AttendanceRecordDto>> GetStudentAttendanceHistoryAsync(int studentId);
}
