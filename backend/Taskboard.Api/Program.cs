using Microsoft.EntityFrameworkCore;
using Taskboard.Api.Data;
using Taskboard.Api.Models;
using Taskboard.Api.Services;

var builder = WebApplication.CreateBuilder(args);

if (!string.IsNullOrEmpty(Environment.GetEnvironmentVariable("PORT")))
{
    builder.WebHost.UseUrls($"http://*:{Environment.GetEnvironmentVariable("PORT")}");
}

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var connectionString = DatabaseConnection.Resolve(builder.Configuration);
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddSingleton<ImageStorageService>();

var corsOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? ["http://localhost:5173"];

if (corsOrigins.Length > 0)
{
    builder.Services.AddCors(options =>
    {
        options.AddDefaultPolicy(policy =>
            policy.WithOrigins(corsOrigins)
                  .AllowAnyHeader()
                  .AllowAnyMethod());
    });
}

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();

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

if (corsOrigins.Length > 0)
{
    app.UseCors();
}
app.UseStaticFiles();
app.MapControllers();

app.Run();
