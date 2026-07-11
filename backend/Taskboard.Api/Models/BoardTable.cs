namespace Taskboard.Api.Models;

public class BoardTable
{
    public int Id { get; set; }
    public int GroupId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Position { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Group Group { get; set; } = null!;
    public ICollection<TaskCard> Cards { get; set; } = [];
}
