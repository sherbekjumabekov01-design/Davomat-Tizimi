using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Backend.DTOs;
using Backend.Services;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { message = "Foydalanuvchi nomi va parol kiritilishi shart." });
        }

        var result = await _authService.AuthenticateAsync(request);
        if (result == null)
        {
            return Unauthorized(new { message = "Foydalanuvchi nomi yoki parol noto'g'ri." });
        }

        return Ok(result);
    }

    [HttpPost("register")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Register([FromBody] RegisterUserDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { message = "Foydalanuvchi nomi va parol to'ldirilishi shart." });
        }

        var result = await _authService.RegisterAsync(request);
        if (result == null)
        {
            return BadRequest(new { message = "Bu foydalanuvchi nomi yoki email allaqachon mavjud." });
        }

        return Ok(result);
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetCurrentUser()
    {
        var username = User.FindFirstValue(ClaimTypes.Name);
        if (string.IsNullOrEmpty(username))
        {
            return Unauthorized();
        }

        var user = await _authService.GetUserByUsernameAsync(username);
        if (user == null)
        {
            return NotFound();
        }

        return Ok(user);
    }

    [HttpPost("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto request)
    {
        if (string.IsNullOrWhiteSpace(request.CurrentPassword) || string.IsNullOrWhiteSpace(request.NewPassword))
        {
            return BadRequest(new { message = "Joriy parol va yangi parol kiritilishi shart." });
        }

        if (request.NewPassword.Length < 6)
        {
            return BadRequest(new { message = "Yangi parol kamida 6 ta belgidan iborat bo'lishi kerak." });
        }

        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(userIdStr, out var userId))
        {
            return Unauthorized();
        }

        var success = await _authService.ChangePasswordAsync(userId, request.CurrentPassword, request.NewPassword);
        if (!success)
        {
            return BadRequest(new { message = "Joriy parol noto'g'ri." });
        }

        return Ok(new { message = "Parol muvaffaqiyatli o'zgartirildi!" });
    }

    [HttpPut("profile")]
    [Authorize]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto request)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(userIdStr, out var userId))
        {
            return Unauthorized();
        }

        var updated = await _authService.UpdateProfileAsync(userId, request);
        if (updated == null)
        {
            return NotFound(new { message = "Foydalanuvchi topilmadi." });
        }

        return Ok(updated);
    }
}
