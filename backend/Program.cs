using backend.Controllers;
using backend.Data;
using backend.Helpers;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// -------------------------
// Configurar DbContext
// -------------------------
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=todo.db"));

// -------------------------
// Configurar Controllers
// -------------------------
builder.Services.AddControllers();

// -------------------------
// Configurar Swagger/OpenAPI
// -------------------------
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// -------------------------
// Configurar CORS para React
// -------------------------
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// -------------------------
// Configurar autenticação
// -------------------------
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = "MyCookieAuth";
    options.DefaultChallengeScheme = "MyCookieAuth";
})
.AddCookie("MyCookieAuth", options =>
{
    options.Cookie.Name = "access_token";
    options.Cookie.HttpOnly = true;
    options.Events.OnValidatePrincipal = context =>
    {
        var token = context.Request.Cookies["access_token"];
        Console.WriteLine("token access:" + token);
        if (string.IsNullOrEmpty(token))
        {
            context.RejectPrincipal();
            return Task.CompletedTask;
        }

        var principal = JwtHelper.ValidateJwt(token, builder.Configuration);
        Console.WriteLine("principal:" + principal);
        if (principal == null)
            context.RejectPrincipal();
        else
            context.Principal = principal;

        return Task.CompletedTask;
    };
});

// -------------------------
// Registrar HttpClient
// -------------------------
builder.Services.AddHttpClient();

var app = builder.Build();

// -------------------------
// Middleware
// -------------------------
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

// **IMPORTANTE: ordem correta**
app.UseCors("AllowFrontend");

app.UseAuthentication(); // <--- Esquecer disso gera erros de DI
app.UseAuthorization();

// -------------------------
// Mapear Controllers
// -------------------------
app.MapControllers();

app.Run();
