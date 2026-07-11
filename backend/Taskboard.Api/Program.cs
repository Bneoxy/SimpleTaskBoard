using Microsoft.EntityFrameworkCore;
using Taskboard.Api.Data;
using Taskboard.Api.Models;
using Taskboard.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddSingleton<ImageStorageService>();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
    EnsureImageUrlColumn(db);

    if (!db.Groups.Any())
    {
        var group = new Group
        {
            Name = "My Workspace",
            Description = "Your first project group",
            Position = 0
        };

        var todo = new BoardTable { Name = "To Do", Position = 0, Group = group };
        var doing = new BoardTable { Name = "In Progress", Position = 1, Group = group };
        var done = new BoardTable { Name = "Done", Position = 2, Group = group };

        db.Groups.Add(group);
        db.Tables.AddRange(todo, doing, done);

        db.Cards.AddRange(
            new TaskCard { Title = "Set up the project", Table = todo, Position = 0 },
            new TaskCard { Title = "Design the board layout", Table = todo, Position = 1 },
            new TaskCard { Title = "Build the API", Table = doing, Position = 0 },
            new TaskCard { Title = "Initialize git repo", Table = done, Position = 0 }
        );

        db.SaveChanges();
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();
app.UseStaticFiles();
app.MapControllers();

app.Run();

static void EnsureImageUrlColumn(AppDbContext db)
{
    try
    {
        db.Database.ExecuteSqlRaw("ALTER TABLE Cards ADD COLUMN ImageUrl TEXT NULL");
    }
    catch
    {
        // Column already exists on databases created after this change.
    }
}
