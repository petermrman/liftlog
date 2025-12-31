# LiftLog Refactor Briefing

## Doel
Bouw LiftLog om naar een zelfstandig systeem dat slim variatie aanbrengt zonder handmatige input. De app moet zelf bepalen welke oefeningen gepast zijn op basis van bewegingspatronen, recente trainingshistorie en de hoofdlift van de dag.

---

## Architectuur

### Bestandsstructuur
```
LiftLog/
├── index.html          ← hoofdapplicatie
├── data/
│   ├── exercises.json  ← complete oefeningendatabase
│   └── templates.json  ← trainingssjablonen per dag
```

Of alles in index.html als embedded JSON (voor GitHub Pages compatibiliteit).

---

## 1. Oefeningendatabase (exercises.json)

### Structuur per oefening
```json
{
  "id": "cable_row",
  "name": "Cable Row",
  "pattern": "pull",
  "plane": "horizontal",
  "equipment": ["cable"],
  "muscles": {
    "primary": ["lats", "rhomboids"],
    "secondary": ["biceps", "rear_delts"]
  },
  "bilateral": true,
  "notes": "Scapula squeeze"
}
```

### Bewegingspatronen (pattern)
- `squat` - knie-dominant (quads)
- `hinge` - heup-dominant (hamstrings, glutes, lower back)
- `push_horizontal` - horizontaal duwen (borst, triceps)
- `push_vertical` - verticaal duwen (schouders, triceps)
- `pull_horizontal` - horizontaal trekken (lats, rhomboids)
- `pull_vertical` - verticaal trekken (lats)
- `carry` - dragen/vasthouden (grip, core)
- `core` - core stabiliteit
- `activation` - activatie/warming-up

### Equipment types
- `barbell`
- `dumbbell`
- `kettlebell`
- `cable`
- `machine`
- `bodyweight`
- `band`

### Complete oefeningenlijst

#### SQUAT PATTERN
```json
{
  "back_squat": {
    "name": "Back Squat",
    "pattern": "squat",
    "equipment": ["barbell"],
    "muscles": {"primary": ["quads", "glutes"], "secondary": ["core", "adductors"]},
    "isMainLift": true
  },
  "goblet_squat": {
    "name": "Goblet Squat",
    "pattern": "squat",
    "equipment": ["dumbbell", "kettlebell"],
    "muscles": {"primary": ["quads", "glutes"], "secondary": ["core"]}
  },
  "bulgarian_split_squat": {
    "name": "Bulgarian Split Squat",
    "pattern": "squat",
    "equipment": ["dumbbell", "kettlebell", "barbell", "bodyweight"],
    "muscles": {"primary": ["quads", "glutes"], "secondary": ["core"]},
    "unilateral": true
  },
  "leg_press": {
    "name": "Leg Press",
    "pattern": "squat",
    "equipment": ["machine"],
    "muscles": {"primary": ["quads", "glutes"], "secondary": []}
  },
  "leg_press_uni": {
    "name": "Leg Press uni",
    "pattern": "squat",
    "equipment": ["machine"],
    "muscles": {"primary": ["quads", "glutes"], "secondary": []},
    "unilateral": true
  },
  "front_squat": {
    "name": "Front Squat",
    "pattern": "squat",
    "equipment": ["barbell"],
    "muscles": {"primary": ["quads"], "secondary": ["core", "upper_back"]}
  },
  "hack_squat": {
    "name": "Hack Squat",
    "pattern": "squat",
    "equipment": ["machine"],
    "muscles": {"primary": ["quads"], "secondary": ["glutes"]}
  }
}
```

#### HINGE PATTERN
```json
{
  "conventional_deadlift": {
    "name": "Conventional Deadlift",
    "pattern": "hinge",
    "equipment": ["barbell"],
    "muscles": {"primary": ["hamstrings", "glutes", "lower_back"], "secondary": ["lats", "traps", "grip"]},
    "isMainLift": true
  },
  "romanian_deadlift": {
    "name": "Romanian Deadlift",
    "pattern": "hinge",
    "equipment": ["barbell", "dumbbell"],
    "muscles": {"primary": ["hamstrings", "glutes"], "secondary": ["lower_back"]}
  },
  "stiff_leg_deadlift": {
    "name": "Stiff Leg Deadlift",
    "pattern": "hinge",
    "equipment": ["barbell", "dumbbell"],
    "muscles": {"primary": ["hamstrings"], "secondary": ["glutes", "lower_back"]}
  },
  "good_morning": {
    "name": "Good Morning",
    "pattern": "hinge",
    "equipment": ["barbell"],
    "muscles": {"primary": ["hamstrings", "lower_back"], "secondary": ["glutes"]}
  },
  "hip_thrust": {
    "name": "Hip Thrust",
    "pattern": "hinge",
    "equipment": ["barbell", "machine"],
    "muscles": {"primary": ["glutes"], "secondary": ["hamstrings"]}
  },
  "hip_hinge_stick": {
    "name": "Hip Hinge met stok",
    "pattern": "activation",
    "equipment": ["bodyweight"],
    "muscles": {"primary": ["hamstrings"], "secondary": []},
    "isActivation": true
  }
}
```

#### PUSH HORIZONTAL
```json
{
  "bench_press": {
    "name": "Bench Press",
    "pattern": "push_horizontal",
    "equipment": ["barbell"],
    "muscles": {"primary": ["chest", "triceps"], "secondary": ["front_delts"]},
    "isMainLift": true
  },
  "incline_db_press": {
    "name": "Incline DB Press",
    "pattern": "push_horizontal",
    "equipment": ["dumbbell"],
    "muscles": {"primary": ["upper_chest", "triceps"], "secondary": ["front_delts"]},
    "angle": "incline"
  },
  "incline_barbell_press": {
    "name": "Incline Barbell Press",
    "pattern": "push_horizontal",
    "equipment": ["barbell"],
    "muscles": {"primary": ["upper_chest", "triceps"], "secondary": ["front_delts"]},
    "angle": "incline"
  },
  "dumbbell_bench_press": {
    "name": "Dumbbell Bench Press",
    "pattern": "push_horizontal",
    "equipment": ["dumbbell"],
    "muscles": {"primary": ["chest", "triceps"], "secondary": ["front_delts"]}
  },
  "dips": {
    "name": "Dips",
    "pattern": "push_horizontal",
    "equipment": ["bodyweight"],
    "muscles": {"primary": ["chest", "triceps"], "secondary": ["front_delts"]}
  },
  "machine_chest_press": {
    "name": "Machine Chest Press",
    "pattern": "push_horizontal",
    "equipment": ["machine"],
    "muscles": {"primary": ["chest", "triceps"], "secondary": ["front_delts"]}
  }
}
```

#### PUSH VERTICAL
```json
{
  "push_press": {
    "name": "Push Press",
    "pattern": "push_vertical",
    "equipment": ["barbell"],
    "muscles": {"primary": ["shoulders", "triceps"], "secondary": ["upper_chest", "core"]},
    "isMainLift": true
  },
  "overhead_press": {
    "name": "Overhead Press",
    "pattern": "push_vertical",
    "equipment": ["barbell"],
    "muscles": {"primary": ["shoulders", "triceps"], "secondary": ["core"]}
  },
  "dumbbell_shoulder_press": {
    "name": "Dumbbell Shoulder Press",
    "pattern": "push_vertical",
    "equipment": ["dumbbell"],
    "muscles": {"primary": ["shoulders", "triceps"], "secondary": []}
  },
  "arnold_press": {
    "name": "Arnold Press",
    "pattern": "push_vertical",
    "equipment": ["dumbbell"],
    "muscles": {"primary": ["shoulders", "triceps"], "secondary": []}
  },
  "landmine_press": {
    "name": "Landmine Press",
    "pattern": "push_vertical",
    "equipment": ["barbell"],
    "muscles": {"primary": ["shoulders", "chest"], "secondary": ["core"]}
  }
}
```

#### PULL HORIZONTAL
```json
{
  "cable_row": {
    "name": "Cable Row",
    "pattern": "pull_horizontal",
    "equipment": ["cable"],
    "muscles": {"primary": ["lats", "rhomboids"], "secondary": ["biceps", "rear_delts"]}
  },
  "seated_cable_row": {
    "name": "Seated Cable Row",
    "pattern": "pull_horizontal",
    "equipment": ["cable"],
    "muscles": {"primary": ["lats", "rhomboids"], "secondary": ["biceps", "rear_delts"]}
  },
  "chest_supported_row": {
    "name": "Chest Supported Row",
    "pattern": "pull_horizontal",
    "equipment": ["machine", "dumbbell"],
    "muscles": {"primary": ["lats", "rhomboids"], "secondary": ["biceps", "rear_delts"]}
  },
  "dumbbell_row": {
    "name": "Dumbbell Row",
    "pattern": "pull_horizontal",
    "equipment": ["dumbbell"],
    "muscles": {"primary": ["lats", "rhomboids"], "secondary": ["biceps", "rear_delts"]},
    "unilateral": true
  },
  "barbell_row": {
    "name": "Barbell Row",
    "pattern": "pull_horizontal",
    "equipment": ["barbell"],
    "muscles": {"primary": ["lats", "rhomboids"], "secondary": ["biceps", "lower_back"]}
  },
  "t_bar_row": {
    "name": "T-Bar Row",
    "pattern": "pull_horizontal",
    "equipment": ["barbell"],
    "muscles": {"primary": ["lats", "rhomboids"], "secondary": ["biceps"]}
  },
  "face_pulls": {
    "name": "Face Pulls",
    "pattern": "pull_horizontal",
    "equipment": ["cable"],
    "muscles": {"primary": ["rear_delts", "rhomboids"], "secondary": ["external_rotators"]},
    "isAccessory": true
  }
}
```

#### PULL VERTICAL
```json
{
  "lat_pulldown": {
    "name": "Lat Pulldown",
    "pattern": "pull_vertical",
    "equipment": ["cable"],
    "muscles": {"primary": ["lats"], "secondary": ["biceps", "rear_delts"]}
  },
  "pull_ups": {
    "name": "Pull Ups",
    "pattern": "pull_vertical",
    "equipment": ["bodyweight"],
    "muscles": {"primary": ["lats"], "secondary": ["biceps", "rear_delts"]}
  },
  "chin_ups": {
    "name": "Chin Ups",
    "pattern": "pull_vertical",
    "equipment": ["bodyweight"],
    "muscles": {"primary": ["lats", "biceps"], "secondary": ["rear_delts"]}
  },
  "neutral_grip_pulldown": {
    "name": "Neutral Grip Pulldown",
    "pattern": "pull_vertical",
    "equipment": ["cable"],
    "muscles": {"primary": ["lats"], "secondary": ["biceps"]}
  }
}
```

#### CARRY / GRIP
```json
{
  "dead_hang": {
    "name": "Dead Hang",
    "pattern": "carry",
    "equipment": ["bodyweight"],
    "muscles": {"primary": ["grip", "lats"], "secondary": ["core"]},
    "isTimed": true
  },
  "btbbh": {
    "name": "BTBBH",
    "pattern": "carry",
    "equipment": ["barbell"],
    "muscles": {"primary": ["grip", "traps"], "secondary": ["core"]},
    "isTimed": true,
    "note": "Behind The Back Barbell Hold - altijd 2 x max hold"
  },
  "farmer_walk": {
    "name": "Farmer Walk",
    "pattern": "carry",
    "equipment": ["dumbbell", "kettlebell"],
    "muscles": {"primary": ["grip", "traps", "core"], "secondary": []},
    "isTimed": true
  },
  "plate_pinch": {
    "name": "Plate Pinch Hold",
    "pattern": "carry",
    "equipment": ["plate"],
    "muscles": {"primary": ["grip"], "secondary": []},
    "isTimed": true
  }
}
```

#### ACTIVATION
```json
{
  "scapula_retractions": {
    "name": "Scapula Retractions",
    "pattern": "activation",
    "equipment": ["bodyweight"],
    "muscles": {"primary": ["rhomboids", "mid_traps"], "secondary": []},
    "isActivation": true,
    "isCheck": true
  },
  "shoulder_dislocates": {
    "name": "Shoulder Dislocates",
    "pattern": "activation",
    "equipment": ["band", "bodyweight"],
    "muscles": {"primary": ["shoulders"], "secondary": []},
    "isActivation": true,
    "isCheck": true
  },
  "band_pull_aparts": {
    "name": "Band Pull Aparts",
    "pattern": "activation",
    "equipment": ["band"],
    "muscles": {"primary": ["rear_delts", "rhomboids"], "secondary": []},
    "isActivation": true
  }
}
```

---

## 2. Trainingssjablonen (templates.json)

### Structuur
```json
{
  "A": {
    "name": "Squat",
    "mainLift": "back_squat",
    "slots": [
      {
        "order": 1,
        "role": "activation",
        "pattern": "activation",
        "sets": 2,
        "reps": 15,
        "required": false
      },
      {
        "order": 2,
        "role": "main",
        "exerciseId": "back_squat",
        "sets": 4,
        "reps": 5
      },
      {
        "order": 3,
        "role": "accessory",
        "pattern": "hinge",
        "sets": 3,
        "reps": 10,
        "exclude": ["conventional_deadlift"]
      },
      {
        "order": 4,
        "role": "accessory",
        "pattern": "push_horizontal",
        "angle": "incline",
        "sets": 3,
        "reps": 10
      },
      {
        "order": 5,
        "role": "accessory",
        "pattern": "pull_horizontal",
        "sets": 3,
        "reps": 10
      },
      {
        "order": 6,
        "role": "finisher",
        "pattern": "carry",
        "isTimed": true,
        "sets": 1
      }
    ]
  },
  "B": {
    "name": "Bench Press",
    "mainLift": "bench_press",
    "slots": [
      {
        "order": 1,
        "role": "activation",
        "exerciseId": "scapula_retractions",
        "sets": 2,
        "reps": 15
      },
      {
        "order": 2,
        "role": "main",
        "exerciseId": "bench_press",
        "sets": 4,
        "reps": 5
      },
      {
        "order": 3,
        "role": "accessory",
        "pattern": "pull_horizontal",
        "sets": 3,
        "reps": 10
      },
      {
        "order": 4,
        "role": "accessory",
        "pattern": "squat",
        "prefer": "unilateral",
        "sets": 3,
        "reps": 10
      },
      {
        "order": 5,
        "role": "accessory",
        "pattern": "pull_horizontal",
        "prefer": ["face_pulls"],
        "sets": 2,
        "reps": 15
      },
      {
        "order": 6,
        "role": "finisher",
        "exerciseId": "btbbh",
        "sets": 2,
        "isTimed": true
      }
    ]
  },
  "C": {
    "name": "Deadlift",
    "mainLift": "conventional_deadlift",
    "slots": [
      {
        "order": 1,
        "role": "activation",
        "exerciseId": "hip_hinge_stick",
        "sets": 2,
        "reps": 8
      },
      {
        "order": 2,
        "role": "main",
        "exerciseId": "conventional_deadlift",
        "sets": 4,
        "reps": 5
      },
      {
        "order": 3,
        "role": "accessory",
        "pattern": "squat",
        "prefer": "unilateral",
        "sets": 3,
        "reps": 10
      },
      {
        "order": 4,
        "role": "accessory",
        "pattern": "pull_horizontal",
        "prefer": "unilateral",
        "sets": 3,
        "reps": 10
      },
      {
        "order": 5,
        "role": "accessory",
        "pattern": "push_horizontal",
        "sets": 3,
        "reps": 10
      },
      {
        "order": 6,
        "role": "finisher",
        "exerciseId": "dead_hang",
        "sets": 1,
        "isTimed": true
      }
    ]
  },
  "D": {
    "name": "Push Press",
    "mainLift": "push_press",
    "slots": [
      {
        "order": 1,
        "role": "activation",
        "exerciseId": "scapula_retractions",
        "sets": 2,
        "reps": 15
      },
      {
        "order": 2,
        "role": "main",
        "exerciseId": "push_press",
        "sets": 4,
        "reps": 5
      },
      {
        "order": 3,
        "role": "accessory",
        "pattern": "pull_vertical",
        "sets": 3,
        "reps": 10
      },
      {
        "order": 4,
        "role": "accessory",
        "pattern": "squat",
        "exclude": ["back_squat", "front_squat"],
        "sets": 3,
        "reps": 10
      },
      {
        "order": 5,
        "role": "accessory",
        "pattern": "pull_horizontal",
        "sets": 3,
        "reps": 10
      },
      {
        "order": 6,
        "role": "finisher",
        "exerciseId": "btbbh",
        "sets": 2,
        "isTimed": true
      }
    ]
  }
}
```

---

## 3. Slimme Selectie Logica

### Functie: selectExerciseForSlot(slot, recentHistory)

```javascript
function selectExerciseForSlot(slot, recentHistory, allExercises) {
  // 1. Als slot een vast exerciseId heeft, gebruik die
  if (slot.exerciseId) {
    return allExercises[slot.exerciseId];
  }
  
  // 2. Filter oefeningen op pattern
  let candidates = Object.values(allExercises)
    .filter(ex => ex.pattern === slot.pattern);
  
  // 3. Filter op angle indien gespecificeerd
  if (slot.angle) {
    candidates = candidates.filter(ex => ex.angle === slot.angle);
  }
  
  // 4. Filter op unilateral indien preferred
  if (slot.prefer === 'unilateral') {
    const unilateral = candidates.filter(ex => ex.unilateral);
    if (unilateral.length > 0) candidates = unilateral;
  }
  
  // 5. Exclude specifieke oefeningen
  if (slot.exclude) {
    candidates = candidates.filter(ex => !slot.exclude.includes(ex.id));
  }
  
  // 6. Exclude recent gedane oefeningen (laatste 3 dagen)
  const recentExerciseIds = getRecentExerciseIds(recentHistory, 3);
  const notRecent = candidates.filter(ex => !recentExerciseIds.includes(ex.id));
  
  // 7. Als er niet-recente opties zijn, gebruik die
  if (notRecent.length > 0) {
    candidates = notRecent;
  }
  
  // 8. Prefer specifieke oefeningen indien opgegeven
  if (slot.prefer && Array.isArray(slot.prefer)) {
    const preferred = candidates.filter(ex => slot.prefer.includes(ex.id));
    if (preferred.length > 0) return preferred[0];
  }
  
  // 9. Return random uit overgebleven candidates
  return candidates[Math.floor(Math.random() * candidates.length)];
}
```

### Functie: getRecentExerciseIds(history, days)

```javascript
function getRecentExerciseIds(history, days) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  
  return history
    .filter(training => new Date(training.date) >= cutoff)
    .flatMap(training => training.exercises.map(ex => ex.id))
    .filter(Boolean);
}
```

---

## 4. UI Aanpassingen

### Swap functionaliteit
- Bij elke accessory oefening: swap-knop (🔄)
- Klik opent modal met alternatieve oefeningen
- Alternatieven gefilterd op zelfde pattern
- Recent gedane oefeningen gemarkeerd (grijze tekst)
- Na swap: update form

### Vorige gewichten tonen
- Onder elke oefening: klein tekstje
- Format: "Vorige: 23-12 | 80×10, 90×10, 100×10"
- Alleen tonen als er history is

### Datum aanpasbaar
- Date input niet disabled
- Geen automatische overschrijving bij laden

### Groene rand fix
- Card krijgt class "done" als:
  - Check oefening: done === true
  - Weight oefening: minstens 1 set met ingevuld gewicht (niet leeg, niet alleen warmup)
  - Timed oefening: minstens 1 set met ingevulde tijd
- Skipped oefeningen: grijze rand, niet groen

---

## 5. Data Flow

### Bij laden van dag
1. Load template voor gekozen dag
2. Load trainingshistorie uit localStorage
3. Voor elke slot in template:
   - Als vast exerciseId → gebruik die
   - Anders → selectExerciseForSlot() met historie
4. Render form met geselecteerde oefeningen
5. Per oefening: laad vorige gewichten indien beschikbaar

### Bij opslaan
1. Verzamel alle ingevulde data
2. Voeg exercise IDs toe aan elke oefening
3. Sla op in localStorage met datum
4. Update UI

### Bij swap
1. Open modal met alternatieven
2. Filter op zelfde pattern als huidige oefening
3. Markeer recent gedane
4. Bij selectie: vervang oefening in form
5. Laad vorige gewichten voor nieuwe oefening

---

## 6. Bugs om te fixen

### Groene rand inconsistent
- Check logica in renderForm()
- Zorg dat done-check correct werkt voor alle types

### Datum wordt overschreven
- Verwijder automatische datum-set bij form laden
- Alleen default naar vandaag bij eerste load

---

## 7. Prioriteit

1. **Database implementeren** - exercises en templates als JSON
2. **Selectie logica** - slimme keuze op basis van historie
3. **Vorige gewichten** - tonen bij elke oefening
4. **Swap UI** - werkende swap met alternatieven
5. **Bug fixes** - groene rand, datum

---

## 8. Dashboard

### Overzicht scherm (nieuwe tab naast Nieuw/Log/Stats)

```
┌─────────────────────────────────────┐
│  LIFTLOG DASHBOARD                  │
├─────────────────────────────────────┤
│                                     │
│  📅 DEZE WEEK                       │
│  ┌─────┬─────┬─────┬─────┐         │
│  │ Ma  │ Di  │ Wo  │ Do  │ ...     │
│  │ ✓A  │  -  │ ✓B  │  -  │         │
│  └─────┴─────┴─────┴─────┘         │
│                                     │
│  ⏭️ VOLGENDE TRAINING               │
│  Dag C - Deadlift                   │
│  Laatste: 20-12 | Top: 110kg        │
│                                     │
│  🔥 STREAK                          │
│  ████████░░ 8 van 12 weken          │
│                                     │
│  📊 HOOFDLIFTS TREND (4 weken)      │
│  Squat:    60 → 80 → 90 → 100 📈    │
│  Bench:    70 → 80 → 85 → 95  📈    │
│  Deadlift: 90 → 100 → 110     📈    │
│  Press:    40 → 45 → 50       📈    │
│                                     │
│  ⚖️ GEWICHT (uit Apple Health)      │
│  [grafiek laatste 30 dagen]         │
│                                     │
│  🏃 CARDIO DEZE WEEK                │
│  2 sessies | 45 min totaal          │
│                                     │
└─────────────────────────────────────┘
```

### Dashboard componenten

1. **Weekoverzicht**
   - Welke dagen getraind (✓) of gepland
   - Klikbaar naar die training

2. **Volgende training**
   - Welke dag is aan de beurt
   - Laatste keer + topset

3. **Streak/consistentie**
   - Weken achter elkaar getraind
   - Doel: 12 weken

4. **Hoofdlifts trend**
   - Laatste 4 topsets per lift
   - Pijl omhoog/omlaag voor trend

5. **Gewicht grafiek** (later: Apple Health)
   - Voorlopig: handmatige invoer
   - Later: import uit Health

6. **Cardio samenvatting** (later: Apple Health)
   - Voorlopig: handmatige invoer
   - Later: import uit Health

---

## 9. Kalender Export (ICS)

### Functionaliteit

1. **Export knop** in dashboard of settings
2. Genereert .ics bestand met alle trainingen
3. Gebruiker importeert in Apple Calendar

### ICS formaat per training

```ics
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//LiftLog//Training//NL
BEGIN:VEVENT
UID:liftlog-20251228-B@petermrman
DTSTART:20251228T100000
DTEND:20251228T110000
SUMMARY:💪 Dag B - Bench Press
DESCRIPTION:Week 2 | RPE 6-7\n\nOefeningen:\n- Bench Press: 95kg x 5\n- Dumbbell Row: 34kg x 10\n- Bulgarian Split Squat: 30kg x 10\n- Face Pulls: 47.5kg x 15\n- BTBBH: 70kg 60s
LOCATION:Push & Pull Gym
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR
```

### Export opties

1. **Alle trainingen** - complete historie
2. **Per week** - selecteer week
3. **Per maand** - selecteer maand

### Toekomstige trainingen plannen

1. Gebruiker selecteert welke dagen hij traint (bijv. ma/wo/vr)
2. App genereert geplande trainingen voor komende 4 weken
3. Export als .ics met TENTATIVE status
4. Na voltooiing: update naar CONFIRMED

---

## 10. Toekomstige Features (Native iOS App)

Voor later wanneer we de native Swift app bouwen:

### HealthKit integratie
- Gewicht automatisch importeren
- Cardio trainingen importeren
- Workouts exporteren naar Health

### CalendarKit integratie
- Direct in Apple Calendar schrijven
- Geen .ics export nodig
- Real-time sync

### Widgets
- Home screen widget met volgende training
- Lock screen widget met streak

### Apple Watch
- Training loggen vanaf watch
- Rest timer op watch
- Hartslag tijdens training

---

## 11. Prioriteit Update

### Fase 1 (Nu - PWA)
1. Database implementeren ✓
2. Selectie logica ✓
3. Vorige gewichten tonen
4. Swap UI
5. Bug fixes
6. **Dashboard basis**
7. **ICS export**

### Fase 2 (Later - PWA uitbreiding)
1. Handmatige gewicht invoer + grafiek
2. Geplande trainingen
3. Streak tracking
4. PR detectie + viering

### Fase 3 (Toekomst - Native iOS)
1. Swift app bouwen
2. HealthKit integratie
3. CalendarKit integratie
4. Watch app
5. Widgets
6. 💰💰💰

---

## 12. Opmerkingen voor Peter

- BTBBH is altijd 2 x max hold, niet 1 x max
- Training log format: gewicht × reps (100x5 = 100kg voor 5 reps), w = warming-up
- Mac is Engels, iPhone is Nederlands
- App draait op GitHub Pages: petermrman.github.io/liftlog/
- Geïnspireerd door MyStrengthBook features
