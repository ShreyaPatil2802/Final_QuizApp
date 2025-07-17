# Build Stage

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

WORKDIR /app

# Copy and restore dependencies

COPY *.csproj ./

RUN dotnet restore

# Copy everything and publish

COPY . ./

RUN dotnet publish -c Release -o out

# Runtime Stage

FROM mcr.microsoft.com/dotnet/aspnet:8.0

WORKDIR /app

COPY --from=build /app/out .

ENV ASPNETCORE_URLS=http://+:80

EXPOSE 80

ENTRYPOINT ["dotnet", "Working_Final_QuizApp.dll"]

# >>> Microsoft Artifact Registry
# >>> Microsoft Artifact Registry (also known as Microsoft Container Registry or MCR)

#Microsoft Artifact Registry (also known as Microsoft Container Registry or MCR) Discovery Portal