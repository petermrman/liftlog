#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Data file path (exported from LiftLog app)
const DATA_FILE = process.env.LIFTLOG_DATA_FILE || join(__dirname, "..", "data", "liftlog-data.json");

// Load data from local JSON file
function loadData() {
  if (!existsSync(DATA_FILE)) {
    console.error(`Data file not found: ${DATA_FILE}`);
    console.error("Export your data from LiftLog first (Dashboard → Export)");
    return { trainings: [], healthImports: [] };
  }
  try {
    const content = readFileSync(DATA_FILE, "utf8");
    return JSON.parse(content);
  } catch (err) {
    console.error(`Error reading data file: ${err.message}`);
    return { trainings: [], healthImports: [] };
  }
}

// Helper functions
function formatDate(dateStr) {
  if (!dateStr) return "Onbekend";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateStr;
}

function getTopSet(exercise) {
  if (!exercise.sets || exercise.sets.length === 0) return null;
  const workingSets = exercise.sets.filter(s => !s.warmup);
  if (workingSets.length === 0) return null;
  const lastSet = workingSets[workingSets.length - 1];
  return { weight: lastSet.w, reps: lastSet.r };
}

// Create MCP server
const server = new Server(
  {
    name: "liftlog-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_trainings",
        description: "Haal trainingen op uit LiftLog. Kan gefilterd worden op dag (A/B/C/D), datum range, of aantal.",
        inputSchema: {
          type: "object",
          properties: {
            day: {
              type: "string",
              description: "Filter op dag: A (Squat), B (Bench), C (Deadlift), D (Push Press)",
              enum: ["A", "B", "C", "D"],
            },
            limit: {
              type: "number",
              description: "Maximum aantal trainingen om terug te geven (default: 10)",
            },
            from_date: {
              type: "string",
              description: "Vanaf datum (YYYY-MM-DD formaat)",
            },
            to_date: {
              type: "string",
              description: "Tot datum (YYYY-MM-DD formaat)",
            },
          },
        },
      },
      {
        name: "get_training_details",
        description: "Haal details op van een specifieke training, inclusief alle oefeningen en sets.",
        inputSchema: {
          type: "object",
          properties: {
            date: {
              type: "string",
              description: "Datum van de training (YYYY-MM-DD formaat)",
            },
            day: {
              type: "string",
              description: "Dag van de training (A/B/C/D)",
            },
          },
          required: ["date"],
        },
      },
      {
        name: "get_progress",
        description: "Bekijk progressie voor een specifieke oefening over tijd.",
        inputSchema: {
          type: "object",
          properties: {
            exercise: {
              type: "string",
              description: "Naam van de oefening (bijv. 'Back Squat', 'Bench Press', 'Conventional Deadlift', 'Push Press')",
            },
            limit: {
              type: "number",
              description: "Aantal datapunten (default: 10)",
            },
          },
          required: ["exercise"],
        },
      },
      {
        name: "get_stats",
        description: "Haal algemene statistieken op: aantal trainingen, huidige week, streak, etc.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "get_personal_records",
        description: "Haal personal records (PR's) op voor de hoofdlifts.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "search_exercises",
        description: "Zoek naar oefeningen in de database.",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Zoekterm (naam of spiergroep)",
            },
            pattern: {
              type: "string",
              description: "Filter op bewegingspatroon",
              enum: ["squat", "hinge", "push_horizontal", "push_vertical", "pull_horizontal", "pull_vertical", "carry", "isolation"],
            },
          },
        },
      },
    ],
  };
});

// List resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: "liftlog://trainings",
        name: "Alle trainingen",
        description: "Volledige lijst van alle opgeslagen trainingen",
        mimeType: "application/json",
      },
      {
        uri: "liftlog://stats",
        name: "Statistieken",
        description: "Trainingsstatistieken en progressie",
        mimeType: "application/json",
      },
    ],
  };
});

// Read resources
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;
  const data = loadData();

  if (uri === "liftlog://trainings") {
    return {
      contents: [
        {
          uri,
          mimeType: "application/json",
          text: JSON.stringify(data.trainings, null, 2),
        },
      ],
    };
  }

  if (uri === "liftlog://stats") {
    const stats = calculateStats(data.trainings || []);
    return {
      contents: [
        {
          uri,
          mimeType: "application/json",
          text: JSON.stringify(stats, null, 2),
        },
      ],
    };
  }

  throw new Error(`Unknown resource: ${uri}`);
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const data = loadData();

  try {
    switch (name) {
      case "get_trainings": {
        let trainings = data.trainings || [];

        // Filter op dag
        if (args?.day) {
          trainings = trainings.filter((t) => t.day === args.day);
        }

        // Filter op datum range
        if (args?.from_date) {
          trainings = trainings.filter((t) => t.date >= args.from_date);
        }
        if (args?.to_date) {
          trainings = trainings.filter((t) => t.date <= args.to_date);
        }

        // Sorteer op datum (nieuwste eerst)
        trainings.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Limiteer aantal
        const limit = args?.limit || 10;
        trainings = trainings.slice(0, limit);

        // Format output
        const output = trainings.map((t) => {
          const mainLift = t.exercises?.find((e) =>
            ["Back Squat", "Bench Press", "Conventional Deadlift", "Push Press"].includes(e.name)
          );
          const topSet = mainLift ? getTopSet(mainLift) : null;
          const health = t.appleHealth || t.health;

          return {
            datum: formatDate(t.date),
            dag: t.day,
            lift: t.lift,
            week: t.week,
            topset: topSet ? `${topSet.weight}kg x ${topSet.reps}` : "-",
            health: health
              ? {
                  avgHR: Math.round(health.avgHeartRate || health.avgHr || 0),
                  maxHR: Math.round(health.maxHeartRate || health.maxHr || 0),
                  kcal: Math.round(health.activeEnergy || health.totalCal || 0),
                  duur: health.duration || null,
                }
              : null,
          };
        });

        return {
          content: [
            {
              type: "text",
              text: `## Trainingen (${output.length})\n\n${output
                .map(
                  (t) =>
                    `- **${t.datum}** | Dag ${t.dag}: ${t.lift} | Week ${t.week} | Topset: ${t.topset}${
                      t.health ? ` | ❤️ ${t.health.avgHR} bpm | 🔥 ${t.health.kcal} kcal` : ""
                    }`
                )
                .join("\n")}`,
            },
          ],
        };
      }

      case "get_training_details": {
        const trainings = data.trainings || [];

        const training = trainings.find((t) => {
          const dateMatch = t.date === args.date;
          const dayMatch = !args.day || t.day === args.day;
          return dateMatch && dayMatch;
        });

        if (!training) {
          return {
            content: [{ type: "text", text: `Geen training gevonden op ${args.date}` }],
          };
        }

        const health = training.appleHealth || training.health;
        let output = `## ${training.lift} — Dag ${training.day}\n`;
        output += `**Datum:** ${formatDate(training.date)} | **Week:** ${training.week}\n\n`;

        if (health) {
          const avgHR = Math.round(health.avgHeartRate || health.avgHr || 0);
          const maxHR = Math.round(health.maxHeartRate || health.maxHr || 0);
          const kcal = Math.round(health.activeEnergy || health.totalCal || 0);
          output += `**Apple Health:** ❤️ Gem: ${avgHR} bpm | Max: ${maxHR} bpm | 🔥 ${kcal} kcal`;
          if (health.duration) output += ` | ⏱️ ${health.duration}`;
          output += "\n\n";
        }

        output += "### Oefeningen\n\n";

        training.exercises?.forEach((ex) => {
          if (ex.skipped) {
            output += `- ~~${ex.name}~~ *(overgeslagen)*\n`;
          } else if (ex.type === "check") {
            output += `- ${ex.name}: ${ex.done ? "✅" : "⬜"}\n`;
          } else {
            output += `- **${ex.name}**`;
            if (ex.equip) output += ` (${ex.equip})`;
            output += "\n";
            ex.sets?.forEach((s, i) => {
              const prefix = s.warmup ? "  - 🔥 " : "  - ";
              if (ex.type === "timed") {
                output += `${prefix}Set ${i + 1}: ${s.w || "-"}kg × ${s.t || "-"}s\n`;
              } else {
                output += `${prefix}Set ${i + 1}: ${s.w || "-"}kg × ${s.r || "-"} reps\n`;
              }
            });
          }
        });

        if (training.notes) {
          output += `\n**Notities:** ${training.notes}\n`;
        }

        return { content: [{ type: "text", text: output }] };
      }

      case "get_progress": {
        const trainings = data.trainings || [];
        const exercise = args.exercise;
        const limit = args.limit || 10;

        const progress = trainings
          .filter((t) => t.exercises?.some((e) => e.name === exercise && !e.skipped))
          .map((t) => {
            const ex = t.exercises.find((e) => e.name === exercise);
            const topSet = getTopSet(ex);
            return {
              date: t.date,
              weight: topSet?.weight ? parseFloat(topSet.weight) : 0,
              reps: topSet?.reps ? parseInt(topSet.reps) : 0,
            };
          })
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(-limit);

        if (progress.length === 0) {
          return {
            content: [{ type: "text", text: `Geen data gevonden voor "${exercise}"` }],
          };
        }

        const first = progress[0];
        const last = progress[progress.length - 1];
        const diff = last.weight - first.weight;
        const trend = diff > 0 ? `+${diff}kg 📈` : diff < 0 ? `${diff}kg 📉` : "gelijk ➡️";

        let output = `## Progressie: ${exercise}\n\n`;
        output += `**Trend:** ${trend} (${formatDate(first.date)} → ${formatDate(last.date)})\n\n`;
        output += "| Datum | Gewicht | Reps |\n|-------|---------|------|\n";
        progress.forEach((p) => {
          output += `| ${formatDate(p.date)} | ${p.weight}kg | ${p.reps} |\n`;
        });

        return { content: [{ type: "text", text: output }] };
      }

      case "get_stats": {
        const trainings = data.trainings || [];

        if (trainings.length === 0) {
          return { content: [{ type: "text", text: "Geen trainingen gevonden. Exporteer eerst je data vanuit LiftLog." }] };
        }

        // Bereken stats
        const totalTrainings = trainings.filter((t) => !t.isCardio).length;
        const cardioSessions = trainings.filter((t) => t.isCardio).length;

        // Per dag
        const perDay = { A: 0, B: 0, C: 0, D: 0 };
        trainings.forEach((t) => {
          if (t.day && perDay[t.day] !== undefined) perDay[t.day]++;
        });

        // Huidige week
        const weeks = trainings.map((t) => t.week).filter(Boolean);
        const currentWeek = weeks.length ? Math.max(...weeks) : 1;

        // Deze week trainingen
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay() + 1);
        weekStart.setHours(0, 0, 0, 0);
        const thisWeekTrainings = trainings.filter((t) => new Date(t.date) >= weekStart).length;

        // Trainingen met health data
        const withHealth = trainings.filter((t) => t.appleHealth || t.health).length;

        // Laatste training
        const sorted = [...trainings].sort((a, b) => new Date(b.date) - new Date(a.date));
        const lastTraining = sorted[0];

        let output = `## LiftLog Statistieken\n\n`;
        output += `**Totaal trainingen:** ${totalTrainings} lifting + ${cardioSessions} cardio\n`;
        output += `**Huidige programma week:** ${currentWeek}\n`;
        output += `**Deze week getraind:** ${thisWeekTrainings}x\n`;
        output += `**Met Apple Health data:** ${withHealth} trainingen\n\n`;
        output += `### Per dag\n`;
        output += `- Dag A (Squat): ${perDay.A}x\n`;
        output += `- Dag B (Bench): ${perDay.B}x\n`;
        output += `- Dag C (Deadlift): ${perDay.C}x\n`;
        output += `- Dag D (Push Press): ${perDay.D}x\n\n`;
        output += `### Laatste training\n`;
        output += `${formatDate(lastTraining.date)} — ${lastTraining.lift || lastTraining.cardioName} (Dag ${lastTraining.day || "Cardio"})`;

        return { content: [{ type: "text", text: output }] };
      }

      case "get_personal_records": {
        const trainings = data.trainings || [];

        const mainLifts = ["Back Squat", "Bench Press", "Conventional Deadlift", "Push Press"];
        const prs = {};

        mainLifts.forEach((lift) => {
          let maxWeight = 0;
          let prDate = null;
          let prReps = 0;

          trainings.forEach((t) => {
            const ex = t.exercises?.find((e) => e.name === lift && !e.skipped);
            if (!ex) return;

            const topSet = getTopSet(ex);
            if (topSet && parseFloat(topSet.weight) > maxWeight) {
              maxWeight = parseFloat(topSet.weight);
              prDate = t.date;
              prReps = parseInt(topSet.reps) || 0;
            }
          });

          prs[lift] = { weight: maxWeight, reps: prReps, date: prDate };
        });

        let output = `## Personal Records\n\n`;
        output += "| Oefening | PR | Reps | Datum |\n|----------|----|----- |-------|\n";
        mainLifts.forEach((lift) => {
          const pr = prs[lift];
          output += `| ${lift} | ${pr.weight}kg | ${pr.reps} | ${pr.date ? formatDate(pr.date) : "-"} |\n`;
        });

        return { content: [{ type: "text", text: output }] };
      }

      case "search_exercises": {
        // Load exercises from the JSON file
        const exercisesPath = join(__dirname, "..", "data", "exercises.json");

        let exercises = {};
        try {
          const content = readFileSync(exercisesPath, "utf8");
          exercises = JSON.parse(content);
        } catch {
          return {
            content: [{ type: "text", text: "Kan exercises.json niet laden" }],
          };
        }

        let results = Object.entries(exercises).filter(([key]) => !key.startsWith("_"));

        if (args?.query) {
          const q = args.query.toLowerCase();
          results = results.filter(
            ([name, ex]) =>
              name.toLowerCase().includes(q) ||
              ex.muscles?.some((m) => m.toLowerCase().includes(q))
          );
        }

        if (args?.pattern) {
          results = results.filter(([, ex]) => ex.pattern === args.pattern);
        }

        results = results.slice(0, 20);

        if (results.length === 0) {
          return { content: [{ type: "text", text: "Geen oefeningen gevonden" }] };
        }

        let output = `## Oefeningen (${results.length})\n\n`;
        results.forEach(([name, ex]) => {
          output += `- **${name}**`;
          if (ex.pattern) output += ` [${ex.pattern}]`;
          if (ex.muscles) output += ` — ${ex.muscles.join(", ")}`;
          output += "\n";
        });

        return { content: [{ type: "text", text: output }] };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error: ${error.message}` }],
      isError: true,
    };
  }
});

// Calculate stats helper
function calculateStats(trainings) {
  return {
    total: trainings.length,
    lifting: trainings.filter((t) => !t.isCardio).length,
    cardio: trainings.filter((t) => t.isCardio).length,
    withHealth: trainings.filter((t) => t.appleHealth || t.health).length,
  };
}

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("LiftLog MCP server running...");
  console.error(`Data file: ${DATA_FILE}`);
}

main().catch(console.error);
