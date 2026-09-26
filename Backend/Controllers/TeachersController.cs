using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Backend.DTOs;
using Backend.Services;

namespace Backend.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class TeachersController : ControllerBase
{
    private readonly ITeacherService _teacherService;

    public TeachersController(ITeacherService teacherService)
    {
        _teacherService = teacherService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? search)
    {
        var teachers = await _teacherService.GetAllTeachersAsync(search);
        return Ok(teachers);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var teacher = await _teacherService.GetTeacherByIdAsync(id);
        if (teacher == null) return NotFound(new { message = "O'qituvchi topilmadi." });

        return Ok(teacher);
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTeacherDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.FullName))
        {
            return BadRequest(new { message = "O'qituvchining to'liq ismi kiritilishi shart." });
        }

        var created = await _teacherService.CreateTeacherAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateTeacherDto dto)
    {
        var updated = await _teacherService.UpdateTeacherAsync(id, dto);
        if (updated == null) return NotFound(new { message = "O'qituvchi topilmadi." });

        return Ok(updated);
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _teacherService.DeleteTeacherAsync(id);
        if (!success) return NotFound(new { message = "O'qituvchi topilmadi." });

        return NoContent();
    }
}
