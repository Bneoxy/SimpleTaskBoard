using Taskboard.Api.DTOs;
using Taskboard.Api.Models;

namespace Taskboard.Api.Services;

public class ImageStorageService(IWebHostEnvironment env)
{
    private static readonly HashSet<string> AllowedTypes =
    [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp"
    ];

    public async Task<string?> SaveAsync(IFormFile? file)
    {
        if (file is null || file.Length == 0) return null;
        if (!AllowedTypes.Contains(file.ContentType)) return null;

        var uploadsDir = Path.Combine(GetWebRoot(), "uploads");
        Directory.CreateDirectory(uploadsDir);

        var ext = Path.GetExtension(file.FileName);
        if (string.IsNullOrWhiteSpace(ext))
        {
            ext = file.ContentType switch
            {
                "image/png" => ".png",
                "image/gif" => ".gif",
                "image/webp" => ".webp",
                _ => ".jpg"
            };
        }

        var fileName = $"{Guid.NewGuid():N}{ext}";
        var path = Path.Combine(uploadsDir, fileName);

        await using var stream = new FileStream(path, FileMode.Create);
        await file.CopyToAsync(stream);

        return $"/uploads/{fileName}";
    }

    public void DeleteIfExists(string? imageUrl)
    {
        if (string.IsNullOrWhiteSpace(imageUrl) || !imageUrl.StartsWith("/uploads/")) return;

        var path = Path.Combine(GetWebRoot(), imageUrl.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));
        if (File.Exists(path)) File.Delete(path);
    }

    private string GetWebRoot()
    {
        var webRoot = env.WebRootPath;
        if (!string.IsNullOrWhiteSpace(webRoot)) return webRoot;

        webRoot = Path.Combine(env.ContentRootPath, "wwwroot");
        Directory.CreateDirectory(webRoot);
        return webRoot;
    }
}

public static class TaskCardMapper
{
    public static TaskCardDto ToDto(TaskCard card) =>
        new(card.Id, card.TableId, card.Title, card.Description, card.ImageUrl, card.Position, card.DueDate, card.CreatedAt);
}
