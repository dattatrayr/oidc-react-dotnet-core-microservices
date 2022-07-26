using Microsoft.IdentityModel.Tokens;
using Ocelot.DependencyInjection;
using Ocelot.Middleware;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOcelot();
builder.WebHost.ConfigureAppConfiguration(
        config => config.AddJsonFile("ocelot.json"));

var authenticationProviderKey = "IdentityApiKey";
// NUGET — Microsoft.AspNetCore.Authentication.JwtBearer
builder.Services.AddAuthentication()
.AddJwtBearer(authenticationProviderKey, x =>
{
    x.Authority = "https://localhost:5001"; // IDENTITY SERVER URL
                                            //x.RequireHttpsMetadata = false;
    x.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateAudience = false
    };
});

var app = builder.Build();

app.UseOcelot();

app.MapGet("/", () => "Hello World!");

app.Run();
