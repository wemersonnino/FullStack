-- Banco do Strapi (T-SQL / SQL Server)
CREATE DATABASE strapi_cms;
GO

-- Create server login and database user, then grant db_owner role
CREATE LOGIN strapi_user WITH PASSWORD = 'strapi1234567890';
GO

USE strapi_cms;
GO

CREATE USER strapi_user FOR LOGIN strapi_user;
GO

-- Grant full database privileges by adding to db_owner
ALTER ROLE db_owner ADD MEMBER [strapi_user];
GO


-- Banco para API Java (T-SQL / SQL Server)
CREATE DATABASE web_app_api;
GO

CREATE LOGIN api_user WITH PASSWORD = 'webappapi1234567890';
GO

USE web_app_api;
GO

CREATE USER api_user FOR LOGIN api_user;
GO

ALTER ROLE db_owner ADD MEMBER [api_user];
GO


-- Banco para API .NET (T-SQL / SQL Server)
CREATE DATABASE intranet_api;
GO

CREATE LOGIN dotnet_user WITH PASSWORD = 'dotnet1234567890';
GO

USE intranet_api;
GO

CREATE USER dotnet_user FOR LOGIN dotnet_user;
GO

ALTER ROLE db_owner ADD MEMBER [dotnet_user];
GO