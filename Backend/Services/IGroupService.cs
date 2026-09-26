using Backend.DTOs;

namespace Backend.Services;

public interface IGroupService
{
    Task<IEnumerable<GroupDto>> GetAllGroupsAsync();
    Task<GroupDto?> GetGroupByIdAsync(int id);
    Task<GroupDto> CreateGroupAsync(CreateGroupDto dto);
    Task<GroupDto?> UpdateGroupAsync(int id, UpdateGroupDto dto);
    Task<bool> DeleteGroupAsync(int id);
}
