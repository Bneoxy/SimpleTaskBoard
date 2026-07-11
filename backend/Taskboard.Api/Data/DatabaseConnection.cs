namespace Taskboard.Api.Data;

public static class DatabaseConnection
{
    public static string Resolve(IConfiguration configuration)
    {
        var databaseUrl = Environment.GetEnvironmentVariable("DATABASE_URL");
        if (!string.IsNullOrWhiteSpace(databaseUrl))
            return ParseDatabaseUrl(databaseUrl);

        var connectionString = configuration.GetConnectionString("DefaultConnection");
        if (!string.IsNullOrWhiteSpace(connectionString))
            return connectionString;

        throw new InvalidOperationException(
            "No database connection configured. Set ConnectionStrings:DefaultConnection or DATABASE_URL.");
    }

    private static string ParseDatabaseUrl(string databaseUrl)
    {
        var uri = new Uri(databaseUrl);
        var userInfo = uri.UserInfo.Split(':', 2);
        var username = Uri.UnescapeDataString(userInfo[0]);
        var password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : string.Empty;
        var database = uri.AbsolutePath.TrimStart('/');

        var sslMode = uri.Query.Contains("sslmode=require", StringComparison.OrdinalIgnoreCase)
            ? "Require"
            : "Prefer";

        return $"Host={uri.Host};Port={uri.Port};Database={database};Username={username};Password={password};SSL Mode={sslMode};Trust Server Certificate=true";
    }
}
