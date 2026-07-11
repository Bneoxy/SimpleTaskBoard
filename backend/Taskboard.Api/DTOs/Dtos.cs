namespace Taskboard.Api.DTOs;

public record GroupDto(int Id, string Name, string? Description, int Position, DateTime CreatedAt);
public record CreateGroupDto(string Name, string? Description);
public record UpdateGroupDto(string Name, string? Description);

public record TableDto(int Id, int GroupId, string Name, int Position, DateTime CreatedAt, List<TaskCardDto> Cards);
public record CreateTableDto(string Name);
public record UpdateTableDto(string Name);

public record TaskCardDto(
    int Id,
    int TableId,
    string Title,
    string? Description,
    string? ImageUrl,
    int Position,
    DateTime? DueDate,
    DateTime CreatedAt);

public record CreateTaskCardDto(string Title, string? Description, DateTime? DueDate);
public record UpdateTaskCardDto(string Title, string? Description, DateTime? DueDate);
public record MoveTaskCardDto(int TableId, int Position);

public record GroupDetailDto(int Id, string Name, string? Description, int Position, DateTime CreatedAt, List<TableDto> Tables);

public class CreateTaskCardFormDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime? DueDate { get; set; }
    public IFormFile? Image { get; set; }
}

public class UpdateTaskCardFormDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime? DueDate { get; set; }
    public IFormFile? Image { get; set; }
    public bool RemoveImage { get; set; }
}
