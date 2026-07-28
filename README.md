# MG Lab Content OS — Widget

Widget de feed tipo Instagram conectado en vivo a una base de datos de Notion.

## Configuración

1. Crea una integración en [notion.so/my-integrations](https://www.notion.so/my-integrations) y copia el "Internal Integration Secret".
2. Comparte tu base de datos "Content Database" en Notion con esa integración (••• → Connections).
3. Copia el ID de la base de datos desde su URL en Notion.
4. En Vercel, pega esos dos datos como `NOTION_TOKEN` y `NOTION_CALENDAR_DATABASE_ID`, más los datos de perfil (`NEXT_PUBLIC_PROFILE_HANDLE`, `NEXT_PUBLIC_PROFILE_BIO`, `NEXT_PUBLIC_PROFILE_AVATAR_URL`).
5. Despliega. Copia la URL pública y pégala en un bloque Embed dentro de tu página de Notion.

Ver `.env.local.example` para el detalle de cada variable.
