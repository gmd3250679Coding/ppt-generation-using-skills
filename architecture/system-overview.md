# System Overview

The app should let non-technical users upload a company PPT skill, provide an API key, select a model, describe the PPT they need, and preview or export the generated deck from a local web UI.

```mermaid
flowchart TD
    U["User / colleague"] --> FE["React local frontend"]

    FE --> Upload["Upload skill files"]
    FE --> Form["Fill generation brief<br/>company / topic / pages / style / materials"]
    FE --> Key["Provide API key"]
    FE --> Model["Select model"]

    Upload --> BE["Local backend service<br/>Node.js or Python"]
    Form --> BE
    Key --> BE
    Model --> BE

    BE --> SkillParser["Skill parser<br/>read SKILL.md / templates / assets"]
    BE --> PromptBuilder["Prompt builder<br/>combine user brief and skill rules"]
    BE --> LLM["Model adapter<br/>OpenAI / Azure OpenAI / compatible APIs"]

    SkillParser --> PromptBuilder
    PromptBuilder --> LLM

    LLM --> Plan["PPT outline generation"]
    Plan --> SlideGen["Slide content generation"]
    SlideGen --> Renderer["PPT renderer<br/>HTML / PPTX / preview images"]

    Renderer --> Storage["Local file storage<br/>outputs/"]
    Storage --> Preview["Web preview"]
    Preview --> FE

    FE --> Export["Download PPTX / HTML / PDF"]
    Storage --> Export
```

