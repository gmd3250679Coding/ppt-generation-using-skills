# Layered Architecture

```mermaid
flowchart LR
    subgraph Client["Frontend: React"]
        A1["Skill upload"]
        A2["API key settings"]
        A3["Model selection"]
        A4["Generation form"]
        A5["PPT preview"]
        A6["Export download"]
    end

    subgraph Server["Local service"]
        B1["File receiving"]
        B2["Skill validation"]
        B3["Job queue"]
        B4["Generation status"]
        B5["Result file management"]
    end

    subgraph Engine["Generation engine"]
        C1["Skill Loader"]
        C2["Prompt Builder"]
        C3["LLM Adapter"]
        C4["PPT Generator"]
        C5["Preview Renderer"]
    end

    subgraph Providers["Model providers"]
        D1["OpenAI"]
        D2["Azure OpenAI"]
        D3["OpenAI-compatible API"]
    end

    Client --> Server
    Server --> Engine
    Engine --> Providers
    Engine --> Server
    Server --> Client
```

## Responsibilities

- Frontend: simple workflow for upload, configuration, generation progress, preview, and download.
- Local service: API boundaries, validation, job orchestration, and local file management.
- Generation engine: skill loading, prompt assembly, model calls, deck generation, and preview rendering.
- Providers: model-specific API integration behind a stable internal interface.

