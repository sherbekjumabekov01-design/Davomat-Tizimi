using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Backend.DTOs;
using Backend.Services;

namespace Backend.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class StudentsController : ControllerBase
{
    private readonly IStudentService _studentService;

    public StudentsController(IStudentService studentService)
    {
        _studentService = studentService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int? groupId, [FromQuery] string? search, [FromQuery] Backend.Models.StudentStatus? status)
    {
        var students = await _studentService.GetAllStudentsAsync(groupId, search, status);
        return Ok(students);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var student = await _studentService.GetStudentByIdAsync(id);
        if (student == null) return NotFound(new { message = "Talaba topilmadi." });

        return Ok(student);
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateStudentDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.FullName))
        {
            return BadRequest(new { message = "Talabaning to'liq ismi kiritilishi shart." });
        }

        var created = await _studentService.CreateStudentAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateStudentDto dto)
    {
        var updated = await _studentService.UpdateStudentAsync(id, dto);
        if (updated == null) return NotFound(new { message = "Talaba topilmadi." });

        return Ok(updated);
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _studentService.DeleteStudentAsync(id);
        if (!success) return NotFound(new { message = "Talaba topilmadi." });

        return NoContent();
    }

    [HttpGet("{id}/attendance")]
    public async Task<IActionResult> GetAttendanceHistory(int id)
    {
        var history = await _studentService.GetStudentAttendanceHistoryAsync(id);
        return Ok(history);
    }

    [HttpGet("export/csv")]
    public async Task<IActionResult> ExportCsv([FromQuery] int? groupId)
    {
        var students = await _studentService.GetAllStudentsAsync(groupId);
        var sb = new System.Text.StringBuilder();
        sb.AppendLine("\"№\";\"F.I.Sh.\";\"Student ID\";\"Guruh\";\"Telefon\";\"Ota-ona\";\"Ota-ona tel\";\"Holati\";\"Qatnashish %\"");
        int i = 1;
        foreach (var s in students)
        {
            sb.AppendLine($"\"{i}\";\"{s.FullName}\";\"{s.StudentCode}\";\"{s.GroupName}\";\"{s.Phone}\";\"{s.ParentName}\";\"{s.ParentPhone}\";\"{s.Status}\";\"{s.AttendanceRate}%\";");
            i++;
        }
        var preamble = System.Text.Encoding.UTF8.GetPreamble();
        var bodyBytes = System.Text.Encoding.UTF8.GetBytes(sb.ToString());
        var result = new byte[preamble.Length + bodyBytes.Length];
        Buffer.BlockCopy(preamble, 0, result, 0, preamble.Length);
        Buffer.BlockCopy(bodyBytes, 0, result, preamble.Length, bodyBytes.Length);
        return File(result, "text/csv; charset=utf-8", "talabalar_royxati.csv");
    }
}
