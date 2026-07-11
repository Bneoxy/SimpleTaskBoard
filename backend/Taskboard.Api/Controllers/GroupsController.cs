using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Taskboard.Api.Data;
using Taskboard.Api.DTOs;
using Taskboard.Api.Models;
using Taskboard.Api.Services;

namespace Taskboard.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GroupsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<GroupDto>>> GetAll()
    {
        var groups = await db.Groups
            .OrderBy(g => g.Position)
            .Select(g => new GroupDto(g.Id, g.Name, g.Description, g.Position, g.CreatedAt))
            .ToListAsync();

        return Ok(groups);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<GroupDetailDto>> GetById(int id)
    {
        var group = await db.Groups
            .Include(g => g.Tables.OrderBy(t => t.Position))
                .ThenInclude(t => t.Cards.OrderBy(c => c.Position))
            .FirstOrDefaultAsync(g => g.Id == id);

        if (group is null) return NotFound();

        return Ok(MapGroupDetail(group));
    }

    [HttpPost]
    public async Task<ActionResult<GroupDto>> Create(CreateGroupDto dto)
    {
        var position = await db.Groups.CountAsync();

        var group = new Group
        {
            Name = dto.Name.Trim(),
            Description = dto.Description?.Trim(),
            Position = position
        };

        db.Groups.Add(group);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = group.Id },
            new GroupDto(group.Id, group.Name, group.Description, group.Position, group.CreatedAt));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<GroupDto>> Update(int id, UpdateGroupDto dto)
    {
        var group = await db.Groups.FindAsync(id);
        if (group is null) return NotFound();

        group.Name = dto.Name.Trim();
        group.Description = dto.Description?.Trim();
        await db.SaveChangesAsync();

        return Ok(new GroupDto(group.Id, group.Name, group.Description, group.Position, group.CreatedAt));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var group = await db.Groups.FindAsync(id);
        if (group is null) return NotFound();

        db.Groups.Remove(group);
        await db.SaveChangesAsync();

        return NoContent();
    }

    private static GroupDetailDto MapGroupDetail(Group group) =>
        new(
            group.Id,
            group.Name,
            group.Description,
            group.Position,
            group.CreatedAt,
            group.Tables.Select(t => new TableDto(
                t.Id,
                t.GroupId,
                t.Name,
                t.Position,
                t.CreatedAt,
                t.Cards.Select(c => TaskCardMapper.ToDto(c)).ToList()
            )).ToList()
        );
}
