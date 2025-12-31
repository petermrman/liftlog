# LiftLog MCP Server

MCP server voor LiftLog - toegang tot je trainingsdata via Claude Desktop.

## Beschikbare Tools

| Tool | Beschrijving |
|------|--------------|
| `get_trainings` | Haal trainingen op (filter op dag, datum, aantal) |
| `get_training_details` | Details van een specifieke training |
| `get_progress` | Progressie voor een oefening over tijd |
| `get_stats` | Algemene statistieken |
| `get_personal_records` | PR's voor de hoofdlifts |
| `search_exercises` | Zoek in de oefeningen database |

## Installatie

### 1. Installeer dependencies

```bash
cd /Users/peter/Projecten/LiftLog/mcp-server
npm install
```

### 2. Vind je Firebase UID

Open LiftLog in je browser en voer dit uit in de console (F12 → Console):

```javascript
firebase.auth().currentUser.uid
```

Kopieer de UID (ziet er uit als: `abc123def456...`).

### 3. Configureer Claude Desktop

Open je Claude Desktop config:

```bash
code ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

Voeg de MCP server toe:

```json
{
  "mcpServers": {
    "liftlog": {
      "command": "node",
      "args": ["/Users/peter/Projecten/LiftLog/mcp-server/index.js"],
      "env": {
        "LIFTLOG_UID": "JOUW_FIREBASE_UID_HIER"
      }
    }
  }
}
```

### 4. Herstart Claude Desktop

Sluit Claude Desktop volledig af en open opnieuw.

## Gebruik

In Claude Desktop kun je nu vragen stellen over je trainingen:

- "Laat mijn laatste 5 trainingen zien"
- "Wat is mijn squat progressie?"
- "Hoeveel heb ik deze maand getraind?"
- "Wat zijn mijn PR's?"
- "Laat de details zien van mijn training op 30-12-2025"

## Voorbeelden

### Trainingen opvragen
```
Vraag: "Laat mijn Dag A trainingen zien"
Tool: get_trainings met day="A"
```

### Progressie bekijken
```
Vraag: "Hoe ging mijn bench press deze maand?"
Tool: get_progress met exercise="Bench Press"
```

### Statistieken
```
Vraag: "Geef me een overzicht van mijn training stats"
Tool: get_stats
```

## Troubleshooting

### "LIFTLOG_UID environment variable is required"

Je hebt de UID niet ingesteld. Volg stap 2 en 3.

### "Firebase error: 401 Unauthorized"

De UID is incorrect of je hebt geen toegang. Check of je de juiste UID hebt gekopieerd.

### Server start niet

Check of dependencies geïnstalleerd zijn:
```bash
cd /Users/peter/Projecten/LiftLog/mcp-server
npm install
```

## Technische Details

- **Transport:** stdio (standaard MCP transport)
- **Database:** Firebase Realtime Database (REST API)
- **Authenticatie:** Firebase UID via environment variable
