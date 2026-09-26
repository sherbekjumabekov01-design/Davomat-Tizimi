using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Backend.DTOs;
using Backend.Models;
using Backend.Services;

namespace Backend.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class AttendanceController : ControllerBase
{
    private readonly IAttendanceService _attendanceService;

    public AttendanceController(IAttendanceService attendanceService)
    {
        _attendanceService = attendanceService;
    }

    [HttpGet]
    public async Task<IActionResult> GetRecords(
        [FromQuery] int? groupId, 
        [FromQuery] DateTime? date, 
        [FromQuery] DateTime? startDate, 
        [FromQuery] DateTime? endDate)
    {
        var records = await _attendanceService.GetAttendanceRecordsAsync(groupId, date, startDate, endDate);
        return Ok(records);
    }

    [HttpGet("sheet")]
    public async Task<IActionResult> GetSheet([FromQuery] int groupId, [FromQuery] DateTime? date)
    {
        if (groupId <= 0)
        {
            return BadRequest(new { message = "Guruh tanlanishi shart." });
        }

        var targetDate = date ?? DateTime.UtcNow.Date;
        var sheet = await _attendanceService.GetGroupAttendanceSheetAsync(groupId, targetDate);
        return Ok(sheet);
    }

    public class UpdateSingleStatusDto
    {
        public AttendanceStatus Status { get; set; }
        public string? Note { get; set; }
    }

    [HttpPost("batch")]
    public async Task<IActionResult> SaveBatch([FromBody] BatchAttendanceDto dto)
    {
        if (dto.GroupId <= 0 || dto.Records == null)
        {
            return BadRequest(new { message = "Guruh va davomat ro'yxati to'ldirilishi kerak." });
        }

        var markerName = User.FindFirstValue(ClaimTypes.GivenName) ?? User.FindFirstValue(ClaimTypes.Name) ?? "O'qituvchi";
        var success = await _attendanceService.SaveBatchAttendanceAsync(dto, markerName);
        if (!success)
        {
            return BadRequest(new { message = "Davomatni saqlashda xatolik yuz berdi." });
        }

        return Ok(new { message = "Davomat muvaffaqiyatli saqlandi!" });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateSingle(int id, [FromBody] UpdateSingleStatusDto dto)
    {
        var updated = await _attendanceService.UpdateSingleAttendanceAsync(id, dto.Status, dto.Note);
        if (updated == null) return NotFound(new { message = "Davomat yozuvi topilmadi." });

        return Ok(updated);
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var stats = await _attendanceService.GetAttendanceStatsAsync();
        return Ok(stats);
    }

    [HttpGet("grid")]
    public async Task<IActionResult> GetGrid([FromQuery] int groupId, [FromQuery] int year, [FromQuery] int month)
    {
        var grid = await _attendanceService.GetMonthlyAttendanceGridAsync(groupId, year, month);
        return Ok(grid);
    }

    [HttpPost("toggle")]
    public async Task<IActionResult> Toggle([FromBody] ToggleAttendanceDto dto)
    {
        var status = await _attendanceService.SetOrToggleAttendanceStatusAsync(dto.StudentId, dto.GroupId, dto.Date, dto.Status);
        return Ok(new { status });
    }

    [HttpPost("students/{studentId}/coins")]
    public async Task<IActionResult> UpdateCoins(int studentId, [FromBody] UpdateCoinsDto dto)
    {
        var coins = await _attendanceService.UpdateStudentCoinsAsync(studentId, dto.DeltaCoins);
        return Ok(new { studentId, coins });
    }

    [HttpGet("export/csv")]
    public async Task<IActionResult> ExportCsv([FromQuery] int groupId, [FromQuery] int year, [FromQuery] int month)
    {
        var fileBytes = await _attendanceService.ExportMonthlyAttendanceCsvAsync(groupId, year, month);
        var fileName = $"davomat_guruh_{groupId}_{year}_{month:D2}.csv";
        return File(fileBytes, "text/csv; charset=utf-8", fileName);
    }
}
