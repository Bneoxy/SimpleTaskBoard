using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Taskboard.Api.Data;
using Taskboard.Api.DTOs;
using Taskboard.Api.Models;
using Taskboard.Api.Services;

namespace Taskboard.Api.Controllers;

[ApiController]
[Route("api/groups/{groupId:int}/[controller]")]
public class TablesController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<TableDto>>> GetByGroup(int groupId)
    {
        if (!await db.Groups.AnyAsync(g => g.Id == groupId)) return NotFound("Group not found.");

        var tables = await db.Tables
            .Where(t => t.GroupId == groupId)
            .OrderBy(t => t.Position)
            .Include(t => t.Cards.OrderBy(c => c.Position))
            .Select(t => new TableDto(
                t.Id,
                t.GroupId,
                t.Name,
                t.Position,
                t.CreatedAt,
                t.Cards.Select(c => new TaskCardDto(
                    c.Id, c.TableId, c.Title, c.Description, c.ImageUrl, c.Position, c.DueDate, c.CreatedAt
                )).ToList()
            ))
            .ToListAsync();

        return Ok(tables);
    }

    [HttpPost]
    public async Task<ActionResult<TableDto>> Create(int groupId, CreateTableDto dto)
    {
        if (!await db.Groups.AnyAsync(g => g.Id == groupId)) return NotFound("Group not found.");

        var position = await db.Tables.CountAsync(t => t.GroupId == groupId);

        var table = new BoardTable
        {
            GroupId = groupId,
            Name = dto.Name.Trim(),
            Position = position
        };

        db.Tables.Add(table);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { groupId, id = table.Id },
            new TableDto(table.Id, table.GroupId, table.Name, table.Position, table.CreatedAt, []));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<TableDto>> GetById(int groupId, int id)
    {
        var table = await db.Tables
            .Include(t => t.Cards.OrderBy(c => c.Position))
            .FirstOrDefaultAsync(t => t.Id == id && t.GroupId == groupId);

        if (table is null) return NotFound();

        return Ok(new TableDto(
            table.Id,
            table.GroupId,
            table.Name,
            table.Position,
            table.CreatedAt,
            table.Cards.Select(c => TaskCardMapper.ToDto(c)).ToList()
        ));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<TableDto>> Update(int groupId, int id, UpdateTableDto dto)
    {
        var table = await db.Tables.FirstOrDefaultAsync(t => t.Id == id && t.GroupId == groupId);
        if (table is null) return NotFound();

        table.Name = dto.Name.Trim();
        await db.SaveChangesAsync();

        return Ok(new TableDto(table.Id, table.GroupId, table.Name, table.Position, table.CreatedAt, []));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int groupId, int id)
    {
        var table = await db.Tables.FirstOrDefaultAsync(t => t.Id == id && t.GroupId == groupId);
        if (table is null) return NotFound();

        db.Tables.Remove(table);
        await db.SaveChangesAsync();

        return NoContent();
    }
}
