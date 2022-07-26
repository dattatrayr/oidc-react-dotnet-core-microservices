#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src
COPY ["Src/APIGateways/Management.Ocelot.APIGateway/Management.Ocelot.APIGateway.csproj", "Src/APIGateways/Management.Ocelot.APIGateway/"]
RUN dotnet restore "Src/APIGateways/Management.Ocelot.APIGateway/Management.Ocelot.APIGateway.csproj"
COPY . .
WORKDIR "/src/Src/APIGateways/Management.Ocelot.APIGateway"
RUN dotnet build "Management.Ocelot.APIGateway.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Management.Ocelot.APIGateway.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Management.Ocelot.APIGateway.dll"]