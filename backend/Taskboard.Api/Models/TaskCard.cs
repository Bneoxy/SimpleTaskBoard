namespace Taskboard.Api.Models;

public class TaskCard
{
    public int Id { get; set; }
    public int TableId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public int Position { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public BoardTable Table { get; set; } = null!;
}
