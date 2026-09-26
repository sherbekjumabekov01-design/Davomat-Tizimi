using System.Text;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using OpenApiModels = Microsoft.OpenApi.Models;
using Backend.Data;
using Backend.Repositories;
using Backend.Services;

var builder = WebApplication.CreateBuilder(args);

// 1. Database Configuration (SQLite)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ?? "Data Source=davomat.db";
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(connectionString));

// 2. Register Repositories and Services
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IStudentService, StudentService>();
builder.Services.AddScoped<ITeacherService, TeacherService>();
builder.Services.AddScoped<IGroupService, GroupService>();
builder.Services.AddScoped<IAttendanceService, AttendanceService>();

// 3. Controllers and JSON options
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

// 4. CORS configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// 5. JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"] ?? "DavomatTizimiSuperSecretSecureKey2026!WithExtraLengthForSecurity";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "DavomatTizimiBackend";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "DavomatTizimiFrontend";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.UseSecurityTokenValidators = true;
    var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)) { KeyId = "DavomatSecretKey" };
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = signingKey,
        ValidateIssuer = true,
        ValidIssuer = jwtIssuer,
        ValidateAudience = true,
        ValidAudience = jwtAudience,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// 6. Swagger / OpenAPI with JWT Bearer support
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiModels.OpenApiInfo
    {
        Title = "Davomat Tizimi API",
        Version = "v1",
        Description = "Davomat Tizimi - Talabalar va o'qituvchilar davomati tizimi REST API"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiModels.OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Namuna: 'Bearer {token}'",
        Name = "Authorization",
        In = OpenApiModels.ParameterLocation.Header,
        Type = OpenApiModels.SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiModels.OpenApiSecurityRequirement
    {
        {
            new OpenApiModels.OpenApiSecurityScheme
            {
                Reference = new OpenApiModels.OpenApiReference
                {
                    Type = OpenApiModels.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// 7. Seed Database automatically on startup & configure SQLite WAL mode
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    try
    {
        await dbContext.Database.ExecuteSqlRawAsync("PRAGMA journal_mode=WAL;");
        await dbContext.Database.ExecuteSqlRawAsync("PRAGMA busy_timeout=5000;");
        await dbContext.Database.ExecuteSqlRawAsync("PRAGMA synchronous=NORMAL;");
        await DbInitializer.SeedAsync(dbContext);
        Console.WriteLine("[DB] Database initialized and seeded successfully with WAL mode enabled.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[DB Error] Could not initialize database: {ex.Message}");
    }
}

// 8. Middleware Pipeline
if (app.Environment.IsDevelopment() || true)
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Davomat Tizimi API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseStaticFiles(); // Required for Swagger UI embedded assets
app.UseCors("AllowAll");

// Serve Frontend static files if directory exists
var frontendPath = Path.GetFullPath(Path.Combine(app.Environment.ContentRootPath, "..", "Frontend"));
if (Directory.Exists(frontendPath))
{
    var fileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(frontendPath);
    app.UseDefaultFiles(new DefaultFilesOptions
    {
        FileProvider = fileProvider,
        RequestPath = ""
    });
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = fileProvider,
        RequestPath = ""
    });
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
