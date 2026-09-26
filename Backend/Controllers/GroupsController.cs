using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Backend.DTOs;
using Backend.Services;

namespace Backend.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class GroupsController : ControllerBase
{
    private readonly IGroupService _groupService;

    public GroupsController(IGroupService groupService)
    {
        _groupService = groupService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var groups = await _groupService.GetAllGroupsAsync();
        return Ok(groups);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var group = await _groupService.GetGroupByIdAsync(id);
        if (group == null) return NotFound(new { message = "Guruh topilmadi." });

        return Ok(group);
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateGroupDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
        {
            return BadRequest(new { message = "Guruh nomi kiritilishi shart." });
        }

        var created = await _groupService.CreateGroupAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateGroupDto dto)
    {
        var updated = await _groupService.UpdateGroupAsync(id, dto);
        if (updated == null) return NotFound(new { message = "Guruh topilmadi." });

        return Ok(updated);
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _groupService.DeleteGroupAsync(id);
        if (!success)
        {
            return BadRequest(new { message = "Guruhda talabalar mavjud bo'lgani sababli uni o'chirib bo'lmaydi. Avval talabalarni boshqa guruhga o'tkazing." });
        }

        return NoContent();
    }
}
