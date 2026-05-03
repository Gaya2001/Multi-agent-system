# TEAM SETUP GUIDE — Read This First

## Step 1: One person creates the GitHub repo

One team member (anyone) should:

```bash
# Create a new GitHub repo called "medical-triage-mas"
# Clone it locally
git clone https://github.com/<your-org>/medical-triage-mas.git
cd medical-triage-mas

# Copy ALL the SHARED_FILES into the repo root:
#   main.py, graph.py, state.py, config.py, requirements.txt,
#   README.md, __init__.py
# Also create these empty folders:
mkdir -p agents tools tests data logs reports

# Copy shared test harness
cp SHARED_FILES/test_harness.py tests/
cp SHARED_FILES/data/setup_db.py data/

# Create __init__.py in each subfolder
touch agents/__init__.py tools/__init__.py tests/__init__.py

# Initial commit
git add .
git commit -m "Initial project scaffold — shared files"
git push origin main
```

## Step 2: Each member clones and pushes THEIR files

### Hiran:
```bash
git clone https://github.com/<your-org>/medical-triage-mas.git
cd medical-triage-mas

# Copy your files into the correct folders:
cp <your-folder>/agents/intake_agent.py     agents/
cp <your-folder>/tools/parse_symptoms_tool.py  tools/
cp <your-folder>/tests/test_intake_agent.py    tests/

git add agents/intake_agent.py tools/parse_symptoms_tool.py tests/test_intake_agent.py
git commit -m "feat(Hiran): Add IntakeAgent + parse_symptoms_tool + tests"
git push origin main
```

### Gayashan:
```bash
cp <your-folder>/agents/triage_agent.py        agents/
cp <your-folder>/tools/symptom_severity_tool.py tools/
cp <your-folder>/tests/test_triage_agent.py     tests/
cp <your-folder>/data/setup_db.py               data/

git add agents/triage_agent.py tools/symptom_severity_tool.py tests/test_triage_agent.py data/setup_db.py
git commit -m "feat(Gayashan): Add TriageAgent + symptom_severity_tool + tests"
git push origin main
```

### Mihiraj:
```bash
cp <your-folder>/agents/research_agent.py       agents/
cp <your-folder>/tools/condition_lookup_tool.py  tools/
cp <your-folder>/tests/test_research_agent.py    tests/

git add agents/research_agent.py tools/condition_lookup_tool.py tests/test_research_agent.py
git commit -m "feat(Mihiraj): Add ResearchAgent + condition_lookup_tool + tests"
git push origin main
```

### Sonal:
```bash
cp <your-folder>/agents/report_agent.py         agents/
cp <your-folder>/tools/generate_report_tool.py   tools/
cp <your-folder>/tests/test_report_agent.py      tests/

git add agents/report_agent.py tools/generate_report_tool.py tests/test_report_agent.py
git commit -m "feat(Sonal): Add ReportAgent + generate_report_tool + tests"
git push origin main
```

## Step 3: Verify everything works

After all 4 members have pushed:

```bash
git pull origin main
python data/setup_db.py
pip install -r requirements.txt
pytest tests/ -v

# Run the full system (requires Ollama running):
python main.py
```

## Git commit history will show:
```
feat(Hiran):    Add IntakeAgent + parse_symptoms_tool + tests
feat(Gayashan): Add TriageAgent + symptom_severity_tool + tests
feat(Mihiraj):  Add ResearchAgent + condition_lookup_tool + tests
feat(Sonal):    Add ReportAgent + generate_report_tool + tests
```

This proves each student's individual contribution clearly.
