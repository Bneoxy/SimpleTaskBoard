using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Taskboard.Api.Data;
using Taskboard.Api.DTOs;
using Taskboard.Api.Models;
using Taskboard.Api.Services;

namespace Taskboard.Api.Controllers;

[ApiController]
[Route("api/tables/{tableId:int}/[controller]")]
public class CardsController(AppDbContext db, ImageStorageService images) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<TaskCardDto>>> GetByTable(int tableId)
    {
        if (!await db.Tables.AnyAsync(t => t.Id == tableId)) return NotFound("Table not found.");

        var cards = await db.Cards
            .Where(c => c.TableId == tableId)
            .OrderBy(c => c.Position)
            .Select(c => new TaskCardDto(
                c.Id, c.TableId, c.Title, c.Description, c.ImageUrl, c.Position, c.DueDate, c.CreatedAt))
            .ToListAsync();

        return Ok(cards);
    }

    [HttpPost]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<TaskCardDto>> Create(int tableId, [FromForm] CreateTaskCardFormDto dto)
    {
        if (!await db.Tables.AnyAsync(t => t.Id == tableId)) return NotFound("Table not found.");
        if (string.IsNullOrWhiteSpace(dto.Title)) return BadRequest("Title is required.");

        var position = await db.Cards.CountAsync(c => c.TableId == tableId);
        var imageUrl = await images.SaveAsync(dto.Image);

        var card = new TaskCard
        {
            TableId = tableId,
            Title = dto.Title.Trim(),
            Description = dto.Description?.Trim(),
            DueDate = dto.DueDate,
            ImageUrl = imageUrl,
            Position = position
        };

        db.Cards.Add(card);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { tableId, id = card.Id }, TaskCardMapper.ToDto(card));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<TaskCardDto>> GetById(int tableId, int id)
    {
        var card = await db.Cards.FirstOrDefaultAsync(c => c.Id == id && c.TableId == tableId);
        if (card is null) return NotFound();

        return Ok(TaskCardMapper.ToDto(card));
    }

    [HttpPut("{id:int}")]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<TaskCardDto>> Update(int tableId, int id, [FromForm] UpdateTaskCardFormDto dto)
    {
        var card = await db.Cards.FirstOrDefaultAsync(c => c.Id == id && c.TableId == tableId);
        if (card is null) return NotFound();
        if (string.IsNullOrWhiteSpace(dto.Title)) return BadRequest("Title is required.");

        card.Title = dto.Title.Trim();
        card.Description = dto.Description?.Trim();
        card.DueDate = dto.DueDate;

        if (dto.RemoveImage)
        {
            images.DeleteIfExists(card.ImageUrl);
            card.ImageUrl = null;
        }

        if (dto.Image is not null && dto.Image.Length > 0)
        {
            images.DeleteIfExists(card.ImageUrl);
            card.ImageUrl = await images.SaveAsync(dto.Image);
        }

        await db.SaveChangesAsync();

        return Ok(TaskCardMapper.ToDto(card));
    }

    [HttpPut("{id:int}/move")]
    public async Task<ActionResult<TaskCardDto>> Move(int tableId, int id, MoveTaskCardDto dto)
    {
        var card = await db.Cards.FirstOrDefaultAsync(c => c.Id == id);
        if (card is null) return NotFound();

        if (!await db.Tables.AnyAsync(t => t.Id == dto.TableId)) return BadRequest("Target table not found.");

        var sourceTableId = card.TableId;
        var targetTableId = dto.TableId;
        var targetPosition = dto.Position;

        if (sourceTableId == targetTableId)
        {
            var cards = await db.Cards
                .Where(c => c.TableId == sourceTableId)
                .OrderBy(c => c.Position)
                .ToListAsync();

            var currentIndex = cards.FindIndex(c => c.Id == card.Id);
            if (currentIndex < 0) return NotFound();

            cards.RemoveAt(currentIndex);
            targetPosition = Math.Clamp(targetPosition, 0, cards.Count);
            cards.Insert(targetPosition, card);

            for (var i = 0; i < cards.Count; i++)
                cards[i].Position = i;
        }
        else
        {
            var sourceCards = await db.Cards
                .Where(c => c.TableId == sourceTableId && c.Id != card.Id)
                .OrderBy(c => c.Position)
                .ToListAsync();

            for (var i = 0; i < sourceCards.Count; i++)
                sourceCards[i].Position = i;

            var targetCards = await db.Cards
                .Where(c => c.TableId == targetTableId)
                .OrderBy(c => c.Position)
                .ToListAsync();

            card.TableId = targetTableId;
            targetPosition = Math.Clamp(targetPosition, 0, targetCards.Count);
            targetCards.Insert(targetPosition, card);

            for (var i = 0; i < targetCards.Count; i++)
                targetCards[i].Position = i;
        }

        await db.SaveChangesAsync();

        return Ok(TaskCardMapper.ToDto(card));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int tableId, int id)
    {
        var card = await db.Cards.FirstOrDefaultAsync(c => c.Id == id && c.TableId == tableId);
        if (card is null) return NotFound();

        images.DeleteIfExists(card.ImageUrl);
        db.Cards.Remove(card);
        await db.SaveChangesAsync();

        var remaining = await db.Cards
            .Where(c => c.TableId == tableId)
            .OrderBy(c => c.Position)
            .ToListAsync();

        for (var i = 0; i < remaining.Count; i++)
            remaining[i].Position = i;

        await db.SaveChangesAsync();

        return NoContent();
    }
}
