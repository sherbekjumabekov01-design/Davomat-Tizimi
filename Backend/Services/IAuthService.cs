using Backend.DTOs;

namespace Backend.Services;

public interface IAuthService
{
    Task<LoginResponseDto?> AuthenticateAsync(LoginRequestDto request);
    Task<UserDto?> RegisterAsync(RegisterUserDto request);
    Task<UserDto?> GetUserByIdAsync(int id);
    Task<UserDto?> GetUserByUsernameAsync(string username);
    Task<bool> ChangePasswordAsync(int userId, string currentPassword, string newPassword);
    Task<UserDto?> UpdateProfileAsync(int userId, UpdateProfileDto dto);
}
