using Microsoft.EntityFrameworkCore;
using Taskboard.Api.Models;

namespace Taskboard.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Group> Groups => Set<Group>();
    public DbSet<BoardTable> Tables => Set<BoardTable>();
    public DbSet<TaskCard> Cards => Set<TaskCard>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Group>(entity =>
        {
            entity.HasIndex(g => g.Position);
        });

        modelBuilder.Entity<BoardTable>(entity =>
        {
            entity.HasIndex(t => new { t.GroupId, t.Position });
            entity.HasOne(t => t.Group)
                .WithMany(g => g.Tables)
                .HasForeignKey(t => t.GroupId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<TaskCard>(entity =>
        {
            entity.HasIndex(c => new { c.TableId, c.Position });
            entity.HasOne(c => c.Table)
                .WithMany(t => t.Cards)
                .HasForeignKey(c => c.TableId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
