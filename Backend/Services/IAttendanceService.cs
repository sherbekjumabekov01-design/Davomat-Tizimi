using Backend.DTOs;
using Backend.Models;

namespace Backend.Services;

public class GroupAttendanceSheetDto
{
    public int GroupId { get; set; }
    public string GroupName { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public List<StudentAttendanceItemDto> Students { get; set; } = new();
}

public class StudentAttendanceItemDto
{
    public int StudentId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string StudentCode { get; set; } = string.Empty;
    public AttendanceStatus? Status { get; set; }
    public string? Note { get; set; }
    public int? AttendanceId { get; set; }
}

public interface IAttendanceService
{
    Task<IEnumerable<AttendanceRecordDto>> GetAttendanceRecordsAsync(int? groupId, DateTime? date, DateTime? startDate, DateTime? endDate);
    Task<GroupAttendanceSheetDto> GetGroupAttendanceSheetAsync(int groupId, DateTime date);
    Task<bool> SaveBatchAttendanceAsync(BatchAttendanceDto dto, string? markedBy);
    Task<AttendanceRecordDto?> UpdateSingleAttendanceAsync(int id, AttendanceStatus status, string? note);
    Task<AttendanceStatsDto> GetAttendanceStatsAsync();
    Task<MonthlyGridResponseDto> GetMonthlyAttendanceGridAsync(int groupId, int year, int month);
    Task<string> SetOrToggleAttendanceStatusAsync(int studentId, int groupId, DateTime date, string? requestedStatus = null);
    Task<int> UpdateStudentCoinsAsync(int studentId, int deltaCoins);
    Task<byte[]> ExportMonthlyAttendanceCsvAsync(int groupId, int year, int month);
}
